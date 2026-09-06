import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Network,
  Plus,
  Search,
  Store,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CLIENT_ONBOARDING_TEMPLATE,
  lifecycleProgress,
} from "@/data/lifecycleTemplates";
import { useClientNetwork } from "@/hooks/useLifecycle";
import { useOperationsPermission } from "@/hooks/useOperationsWorkspace";
import { useProjects } from "@/hooks/useProjectData";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const onboardingStatuses = [
  "not_started",
  "in_progress",
  "blocked",
  "waiting_client",
  "waiting_third_party",
  "ready_for_review",
  "approved",
  "not_applicable",
];
const clientKinds = [
  "direct",
  "sub_client",
  "branch",
  "franchisee",
  "merchant",
  "venue",
  "partner_client",
];
const emptyClient = {
  name: "",
  parent_account_id: "",
  client_kind: "direct",
  service_status: "prospect",
  territory: "UK",
  email: "",
  phone: "",
  legal_name: "",
};
const emptySite = {
  site_name: "",
  site_type: "branch",
  trading_name: "",
  legal_name: "",
  territory: "UK",
  address: "",
  postcode: "",
  manager_name: "",
  manager_email: "",
  manager_phone: "",
  status: "planned",
  target_go_live: "",
};

function human(value: string) {
  return value.replaceAll("_", " ");
}

export default function ClientNetwork() {
  const { data: projects = [] } = useProjects();
  const { data: permission } = useOperationsPermission();
  const [projectId, setProjectId] = useState("");
  const selectedProjectId = projectId || projects[0]?.id || null;
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const {
    data = { accounts: [], sites: [], onboarding: [] },
    isLoading,
    error,
  } = useClientNetwork(selectedProjectId);
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const activeAccountId = data.accounts.some(
    (account) => account.id === accountId,
  )
    ? accountId
    : data.accounts[0]?.id || "";
  const activeAccount = data.accounts.find(
    (account) => account.id === activeAccountId,
  );
  const [search, setSearch] = useState("");
  const [siteId, setSiteId] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [siteForm, setSiteForm] = useState(emptySite);
  const filteredAccounts = useMemo(
    () =>
      data.accounts.filter((account) =>
        `${account.name} ${account.legal_name} ${account.client_kind} ${account.service_status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [data.accounts, search],
  );
  const sites = data.sites.filter(
    (site) => site.account_id === activeAccountId,
  );
  const activeSiteId = sites.some((site) => site.id === siteId) ? siteId : "";
  const activeSite = sites.find((site) => site.id === activeSiteId);
  const onboarding = data.onboarding.filter(
    (item) =>
      item.account_id === activeAccountId &&
      (activeSiteId ? item.site_id === activeSiteId : !item.site_id),
  );
  const selectedProgress = lifecycleProgress(onboarding);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ["client-network", selectedProjectId],
    });

  const createClient = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProjectId) return;
    const { data: account, error: accountError } = await supabase
      .from("crm_accounts")
      .insert({
        name: clientForm.name,
        legal_name: clientForm.legal_name || null,
        parent_account_id: clientForm.parent_account_id || null,
        client_kind: clientForm.client_kind,
        service_status: clientForm.service_status,
        territory: clientForm.territory,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
        account_type: "client",
        stage: clientForm.service_status === "live" ? "won" : "lead",
        project_id: selectedProjectId,
      })
      .select("id")
      .single();
    if (accountError) return toast.error(accountError.message);
    const { error: onboardingError } = await supabase
      .from("client_onboarding_items")
      .insert(
        CLIENT_ONBOARDING_TEMPLATE.map(
          ([stream, title, description, approvalRequired, risk]) => ({
            account_id: account.id,
            workstream: stream,
            title,
            description,
            approval_required: approvalRequired,
            approval_status: approvalRequired
              ? "not_requested"
              : "not_required",
            compliance_risk: risk,
          }),
        ),
      );
    if (onboardingError)
      return toast.error(
        `Client created, but onboarding setup failed: ${onboardingError.message}`,
      );
    setClientForm(emptyClient);
    setClientOpen(false);
    setAccountId(account.id);
    refresh();
    toast.success("Client and full onboarding plan created");
  };

  const createSite = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeAccount || !selectedProjectId) return;
    const { data: site, error: siteError } = await supabase
      .from("client_sites")
      .insert({
        ...siteForm,
        account_id: activeAccount.id,
        project_id: selectedProjectId,
        trading_name: siteForm.trading_name || null,
        legal_name: siteForm.legal_name || null,
        address: siteForm.address || null,
        postcode: siteForm.postcode || null,
        manager_name: siteForm.manager_name || null,
        manager_email: siteForm.manager_email || null,
        manager_phone: siteForm.manager_phone || null,
        target_go_live: siteForm.target_go_live || null,
      })
      .select("id")
      .single();
    if (siteError) return toast.error(siteError.message);
    const { error: onboardingError } = await supabase
      .from("client_onboarding_items")
      .insert(
        CLIENT_ONBOARDING_TEMPLATE.map(
          ([stream, title, description, approvalRequired, risk]) => ({
            account_id: activeAccount.id,
            site_id: site.id,
            workstream: stream,
            title,
            description,
            approval_required: approvalRequired,
            approval_status: approvalRequired
              ? "not_requested"
              : "not_required",
            compliance_risk: risk,
          }),
        ),
      );
    if (onboardingError)
      return toast.error(
        `Site created, but its onboarding plan failed: ${onboardingError.message}`,
      );
    setSiteForm(emptySite);
    setSiteOpen(false);
    setSiteId(site.id);
    refresh();
    toast.success("Client site and onboarding plan added");
  };

  const updateClientStatus = async (service_status: string) => {
    if (!activeAccount) return;
    const { error: updateError } = await supabase
      .from("crm_accounts")
      .update({ service_status })
      .eq("id", activeAccount.id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  const updateOnboarding = async (id: string, status: string) => {
    const { error: updateError } = await supabase
      .from("client_onboarding_items")
      .update({ status })
      .eq("id", id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  const requestApproval = async (id: string, title: string) => {
    if (!activeAccount) return;
    const { error: approvalError } = await supabase
      .from("approval_requests")
      .insert({
        title: `${activeAccount.name}: ${title}`,
        approval_type: "Client onboarding approval",
        project_id: selectedProjectId,
        account_id: activeAccount.id,
        client_onboarding_item_id: id,
        description:
          "Review client evidence and risk before approving this onboarding gate.",
      });
    if (approvalError) return toast.error(approvalError.message);
    await supabase
      .from("client_onboarding_items")
      .update({ approval_status: "pending", status: "ready_for_review" })
      .eq("id", id);
    refresh();
    queryClient.invalidateQueries({ queryKey: ["case-desk"] });
    toast.success("Client approval requested");
  };

  if (!projects.length)
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Add a portfolio project before onboarding clients.
      </div>
    );
  if (error)
    return (
      <div className="text-sm text-destructive">
        Client network could not load: {error.message}
      </div>
    );

  return (
    <div className="max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Downstream client operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Clients, sub-clients and branches
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Manage direct customers and every merchant, restaurant, store,
            venue, franchise or branch beneath them.
          </p>
        </div>
        <select
          value={selectedProjectId ?? ""}
          onChange={(event) => {
            setProjectId(event.target.value);
            setAccountId("");
          }}
          className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm sm:max-w-xs"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code} · {project.name}
            </option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["All clients", data.accounts.length, Building2],
          [
            "Sub-clients",
            data.accounts.filter((account) => !!account.parent_account_id)
              .length,
            Network,
          ],
          ["Sites / branches", data.sites.length, Store],
          [
            "Live",
            data.accounts.filter((account) => account.service_status === "live")
              .length,
            CheckCircle2,
          ],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="glass-card rounded-xl p-4">
            <Icon size={17} className="text-primary" />
            <div className="mt-3 text-2xl font-bold">{String(value)}</div>
            <div className="text-xs text-muted-foreground">{String(label)}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="glass-card rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clients"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            {permission?.canManage && (
              <Button
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setClientOpen(true)}
                aria-label="Add client"
              >
                <Plus size={16} />
              </Button>
            )}
          </div>
          <div className="mt-3 max-h-[60dvh] space-y-2 overflow-y-auto">
            {filteredAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  setAccountId(account.id);
                  setSiteId("");
                }}
                className={cn(
                  "w-full rounded-xl border p-3 text-left",
                  activeAccountId === account.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/40 bg-muted/10",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{account.name}</div>
                    <div className="mt-1 text-[10px] capitalize text-muted-foreground">
                      {human(account.client_kind)} ·{" "}
                      {human(account.service_status)}
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </div>
                {account.parent_account_id && (
                  <div className="mt-2 text-[10px] text-primary">
                    Under{" "}
                    {data.accounts.find(
                      (parent) => parent.id === account.parent_account_id,
                    )?.name || "parent client"}
                  </div>
                )}
              </button>
            ))}
            {!isLoading && !filteredAccounts.length && (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No clients yet for {selectedProject?.name}
              </div>
            )}
          </div>
        </aside>

        <main>
          {activeAccount ? (
            <div className="space-y-4">
              <section className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {human(activeAccount.client_kind)}
                    </div>
                    <h2 className="mt-1 text-lg font-semibold">
                      {activeAccount.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activeAccount.legal_name || "Legal name not recorded"} ·{" "}
                      {activeAccount.territory}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {permission?.canManage && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-10"
                        onClick={() => setSiteOpen(true)}
                      >
                        <Plus size={13} className="mr-1" />
                        Add site
                      </Button>
                    )}
                    <select
                      value={activeAccount.service_status}
                      onChange={(event) =>
                        updateClientStatus(event.target.value)
                      }
                      disabled={!permission?.canManage}
                      className="min-h-10 rounded-lg border border-border bg-background px-2 text-xs capitalize"
                    >
                      {[
                        "prospect",
                        "trial",
                        "onboarding",
                        "live",
                        "paused",
                        "offboarded",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/30 p-3">
                    <div className="text-lg font-bold">{selectedProgress}%</div>
                    <div className="text-[10px] text-muted-foreground">
                      Onboarding
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-3">
                    <div className="text-lg font-bold">{sites.length}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Sites
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-3">
                    <div className="text-lg font-bold">
                      {
                        onboarding.filter(
                          (item) => item.approval_status === "pending",
                        ).length
                      }
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Approvals
                    </div>
                  </div>
                </div>
                {sites.length > 0 && (
                  <div className="native-scroll mt-4 flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => setSiteId("")}
                      className={cn(
                        "min-w-40 rounded-xl border p-3 text-left",
                        !activeSiteId
                          ? "border-primary/40 bg-primary/10"
                          : "border-border/40 bg-muted/10",
                      )}
                    >
                      <div className="text-xs font-semibold">Main account</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Company-wide onboarding
                      </div>
                    </button>
                    {sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => setSiteId(site.id)}
                        className={cn(
                          "min-w-48 rounded-xl border p-3 text-left",
                          activeSiteId === site.id
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/40 bg-muted/10",
                        )}
                      >
                        <div className="text-xs font-semibold">
                          {site.site_name}
                        </div>
                        <div className="mt-1 text-[10px] capitalize text-muted-foreground">
                          {site.site_type} · {site.status}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {site.postcode || site.territory}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">
                  {activeSite
                    ? `${activeSite.site_name} onboarding and compliance`
                    : "Client onboarding and compliance"}
                </h2>
                {onboarding.map((item) => (
                  <article key={item.id} className="glass-card rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {item.workstream}
                        </div>
                        <h3 className="mt-1 text-sm font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-semibold capitalize",
                          item.compliance_risk === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.compliance_risk}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {permission?.canManage ? (
                        <select
                          aria-label={`Status for ${item.title}`}
                          value={item.status}
                          onChange={(event) =>
                            updateOnboarding(item.id, event.target.value)
                          }
                          className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-xs capitalize"
                        >
                          {onboardingStatuses
                            .filter(
                              (status) =>
                                !(
                                  item.approval_required &&
                                  status === "approved"
                                ),
                            )
                            .map((status) => (
                              <option key={status} value={status}>
                                {human(status)}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-xs capitalize">
                          {human(item.status)}
                        </span>
                      )}
                      <span className="rounded-md bg-muted/40 px-2 py-1 text-[10px] capitalize">
                        {human(item.approval_status)}
                      </span>
                    </div>
                    {permission?.canManage &&
                      item.approval_required &&
                      !["pending", "approved"].includes(
                        item.approval_status,
                      ) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 min-h-9 w-full"
                          onClick={() => requestApproval(item.id, item.title)}
                        >
                          Request approval
                        </Button>
                      )}
                  </article>
                ))}
              </section>
            </div>
          ) : (
            <div className="glass-card rounded-2xl py-20 text-center text-sm text-muted-foreground">
              Select or add a client to manage its full lifecycle.
            </div>
          )}
        </main>
      </div>

      <Dialog open={clientOpen} onOpenChange={setClientOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add client or sub-client</DialogTitle>
          </DialogHeader>
          <form onSubmit={createClient} className="space-y-3">
            <Input
              required
              value={clientForm.name}
              onChange={(event) =>
                setClientForm({ ...clientForm, name: event.target.value })
              }
              placeholder="Client trading name"
            />
            <Input
              value={clientForm.legal_name}
              onChange={(event) =>
                setClientForm({ ...clientForm, legal_name: event.target.value })
              }
              placeholder="Legal name"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={clientForm.client_kind}
                onChange={(event) =>
                  setClientForm({
                    ...clientForm,
                    client_kind: event.target.value,
                  })
                }
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm capitalize"
              >
                {clientKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {human(kind)}
                  </option>
                ))}
              </select>
              <select
                value={clientForm.territory}
                onChange={(event) =>
                  setClientForm({
                    ...clientForm,
                    territory: event.target.value,
                  })
                }
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option>UK</option>
                <option>DE</option>
                <option>INT</option>
              </select>
            </div>
            <select
              value={clientForm.parent_account_id}
              onChange={(event) =>
                setClientForm({
                  ...clientForm,
                  parent_account_id: event.target.value,
                  client_kind: event.target.value
                    ? "sub_client"
                    : clientForm.client_kind,
                })
              }
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Direct client / no parent</option>
              {data.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  Under {account.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="email"
                value={clientForm.email}
                onChange={(event) =>
                  setClientForm({ ...clientForm, email: event.target.value })
                }
                placeholder="Email"
              />
              <Input
                value={clientForm.phone}
                onChange={(event) =>
                  setClientForm({ ...clientForm, phone: event.target.value })
                }
                placeholder="Phone"
              />
            </div>
            <Button className="w-full" type="submit">
              Create client and onboarding plan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={siteOpen} onOpenChange={setSiteOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add site for {activeAccount?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={createSite} className="space-y-3">
            <Input
              required
              value={siteForm.site_name}
              onChange={(event) =>
                setSiteForm({ ...siteForm, site_name: event.target.value })
              }
              placeholder="Branch, restaurant, shop or venue name"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={siteForm.site_type}
                onChange={(event) =>
                  setSiteForm({ ...siteForm, site_type: event.target.value })
                }
                placeholder="Site type"
              />
              <Input
                value={siteForm.postcode}
                onChange={(event) =>
                  setSiteForm({ ...siteForm, postcode: event.target.value })
                }
                placeholder="Postcode"
              />
            </div>
            <Textarea
              value={siteForm.address}
              onChange={(event) =>
                setSiteForm({ ...siteForm, address: event.target.value })
              }
              placeholder="Address"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={siteForm.manager_name}
                onChange={(event) =>
                  setSiteForm({ ...siteForm, manager_name: event.target.value })
                }
                placeholder="Manager"
              />
              <Input
                type="email"
                value={siteForm.manager_email}
                onChange={(event) =>
                  setSiteForm({
                    ...siteForm,
                    manager_email: event.target.value,
                  })
                }
                placeholder="Manager email"
              />
              <Input
                value={siteForm.manager_phone}
                onChange={(event) =>
                  setSiteForm({
                    ...siteForm,
                    manager_phone: event.target.value,
                  })
                }
                placeholder="Manager phone"
              />
            </div>
            <Input
              type="date"
              value={siteForm.target_go_live}
              onChange={(event) =>
                setSiteForm({ ...siteForm, target_go_live: event.target.value })
              }
            />
            <Button className="w-full" type="submit">
              Add client site
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
