import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FilePenLine,
  Filter,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  PROJECT_LIFECYCLE_TEMPLATE,
  lifecycleProgress,
} from "@/data/lifecycleTemplates";
import { useProjectLifecycle } from "@/hooks/useLifecycle";
import { useOperationsPermission } from "@/hooks/useOperationsWorkspace";
import { useProjects } from "@/hooks/useProjectData";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const statuses = [
  "not_started",
  "in_progress",
  "blocked",
  "ready_for_review",
  "approved",
  "not_applicable",
];
const emptyProfile = {
  brand_name: "",
  slogan: "",
  service_summary: "",
  business_plan: "",
  target_customers: "",
  payer_model: "",
  pricing_summary: "",
  primary_territory: "INT",
  legal_name: "",
  trademark_status: "not_checked",
  ui_ux_status: "not_started",
  features_status: "not_started",
};

function human(value: string) {
  return value.replaceAll("_", " ");
}

export default function LaunchControl() {
  const { data: projects = [] } = useProjects();
  const { data: permission } = useOperationsPermission();
  const [projectId, setProjectId] = useState("");
  const selectedId = projectId || projects[0]?.id || null;
  const selectedProject = projects.find((project) => project.id === selectedId);
  const {
    data = { profile: null, items: [] },
    isLoading,
    error,
  } = useProjectLifecycle(selectedId);
  const queryClient = useQueryClient();
  const [workstream, setWorkstream] = useState("All");
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);

  useEffect(() => {
    if (!data.profile && selectedProject) {
      setProfileForm({
        ...emptyProfile,
        brand_name: selectedProject.name,
        service_summary: selectedProject.short_description ?? "",
        primary_territory: ["UK", "DE"].includes(selectedProject.territory)
          ? selectedProject.territory
          : "INT",
        legal_name: "",
      });
      return;
    }
    if (data.profile)
      setProfileForm({
        brand_name: data.profile.brand_name,
        slogan: data.profile.slogan ?? "",
        service_summary: data.profile.service_summary ?? "",
        business_plan: data.profile.business_plan ?? "",
        target_customers: data.profile.target_customers ?? "",
        payer_model: data.profile.payer_model ?? "",
        pricing_summary: data.profile.pricing_summary ?? "",
        primary_territory: data.profile.primary_territory,
        legal_name: data.profile.legal_name ?? "",
        trademark_status: data.profile.trademark_status,
        ui_ux_status: data.profile.ui_ux_status,
        features_status: data.profile.features_status,
      });
  }, [data.profile, selectedProject]);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ["project-lifecycle", selectedId],
    });
  const streams = [
    "All",
    ...new Set(data.items.map((item) => item.workstream)),
  ];
  const filtered = useMemo(
    () =>
      data.items.filter(
        (item) =>
          (workstream === "All" || item.workstream === workstream) &&
          `${item.title} ${item.description} ${item.workstream}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [data.items, search, workstream],
  );
  const progress = lifecycleProgress(data.items);

  const initialise = async () => {
    if (!selectedId || !selectedProject) return;
    const profileResult = await supabase.from("project_profiles").upsert(
      {
        project_id: selectedId,
        brand_name: selectedProject.name,
        service_summary: selectedProject.short_description,
        primary_territory: ["UK", "DE"].includes(selectedProject.territory)
          ? selectedProject.territory
          : "INT",
      },
      { onConflict: "project_id" },
    );
    if (profileResult.error) return toast.error(profileResult.error.message);
    const { error: itemError } = await supabase
      .from("project_lifecycle_items")
      .upsert(
        PROJECT_LIFECYCLE_TEMPLATE.map(
          ([stream, title, description, priority]) => ({
            project_id: selectedId,
            workstream: stream,
            title,
            description,
            priority,
            approval_required: true,
            approval_status: "not_requested",
          }),
        ),
        { onConflict: "project_id,title", ignoreDuplicates: true },
      );
    if (itemError) return toast.error(itemError.message);
    refresh();
    toast.success("Full project plan created");
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId) return;
    const { error: saveError } = await supabase
      .from("project_profiles")
      .upsert(
        { project_id: selectedId, ...profileForm },
        { onConflict: "project_id" },
      );
    if (saveError) return toast.error(saveError.message);
    setProfileOpen(false);
    refresh();
    toast.success("Project brief updated");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error: updateError } = await supabase
      .from("project_lifecycle_items")
      .update({ status })
      .eq("id", id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  const requestApproval = async (id: string, title: string) => {
    if (!selectedId) return;
    const { error: approvalError } = await supabase
      .from("approval_requests")
      .insert({
        title: `${selectedProject?.name}: ${title}`,
        approval_type: "Project lifecycle approval",
        project_id: selectedId,
        lifecycle_item_id: id,
        description:
          "Review the supporting work and evidence before approving this launch gate.",
      });
    if (approvalError) return toast.error(approvalError.message);
    await supabase
      .from("project_lifecycle_items")
      .update({ approval_status: "pending", status: "ready_for_review" })
      .eq("id", id);
    refresh();
    queryClient.invalidateQueries({ queryKey: ["case-desk"] });
    toast.success("Approval requested");
  };

  if (!projects.length)
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Add a project before creating its operating plan.
      </div>
    );
  if (error)
    return (
      <div className="text-sm text-destructive">
        Launch control could not load: {error.message}
      </div>
    );

  const profileComplete = data.profile
    ? [
        data.profile.brand_name,
        data.profile.service_summary,
        data.profile.business_plan,
        data.profile.target_customers,
        data.profile.payer_model,
        data.profile.pricing_summary,
        data.profile.legal_name,
      ].filter(Boolean).length
    : 0;

  return (
    <div className="max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Portfolio launch governance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Project lifecycle control
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            One approved plan from idea and brand identity through build,
            marketing, compliance, launch and operations.
          </p>
        </div>
        <select
          value={selectedId ?? ""}
          onChange={(event) => {
            setProjectId(event.target.value);
            setWorkstream("All");
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

      <section className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {selectedProject?.logo_url && (
              <img
                src={selectedProject.logo_url}
                alt={`${data.profile?.brand_name || selectedProject.name} logo`}
                className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <Rocket size={18} className="text-primary" />
                <h2 className="font-semibold">
                  {data.profile?.brand_name || selectedProject?.name}
                </h2>
              </div>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
                {data.profile?.service_summary ||
                  "The plain-English service description still needs to be completed."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-md bg-muted px-2 py-1">
                  {data.profile?.primary_territory ||
                    selectedProject?.territory}
                </span>
                <span className="rounded-md bg-muted px-2 py-1">
                  Brief {profileComplete}/7
                </span>
                <span className="rounded-md bg-muted px-2 py-1 capitalize">
                  UI/UX {human(data.profile?.ui_ux_status || "not_started")}
                </span>
                <span className="rounded-md bg-muted px-2 py-1 capitalize">
                  Features{" "}
                  {human(data.profile?.features_status || "not_started")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="min-h-10">
              <Link to={`/projects/${selectedId}`}>Full technical record</Link>
            </Button>
            {permission?.canManage && (
              <Button
                variant="outline"
                className="min-h-10"
                onClick={() => setProfileOpen(true)}
              >
                <FilePenLine size={14} className="mr-1" />
                Edit project brief
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Overall readiness", `${progress}%`, ClipboardCheck],
          [
            "Approved gates",
            data.items.filter((item) => item.status === "approved").length,
            BadgeCheck,
          ],
          [
            "Awaiting approval",
            data.items.filter((item) => item.approval_status === "pending")
              .length,
            ShieldCheck,
          ],
          [
            "Blocked",
            data.items.filter((item) => item.status === "blocked").length,
            CalendarClock,
          ],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="glass-card rounded-xl p-4">
            <Icon size={17} className="text-primary" />
            <div className="mt-3 text-2xl font-bold">{String(value)}</div>
            <div className="text-xs text-muted-foreground">{String(label)}</div>
          </div>
        ))}
      </div>

      {!isLoading && !data.items.length && permission?.canManage && (
        <div className="rounded-2xl border border-dashed border-primary/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This project does not yet have its full operating plan.
          </p>
          <Button className="mt-4" onClick={initialise}>
            <Plus size={14} className="mr-1" />
            Create complete plan
          </Button>
        </div>
      )}

      {!!data.items.length && (
        <>
          <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
            <div className="native-scroll flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/20 p-1">
              <Filter
                size={14}
                className="m-2 shrink-0 text-muted-foreground"
              />
              {streams.map((stream) => (
                <button
                  key={stream}
                  onClick={() => setWorkstream(stream)}
                  className={cn(
                    "min-h-9 whitespace-nowrap rounded-lg px-3 text-xs",
                    workstream === stream
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {stream}
                </button>
              ))}
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 md:w-72">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search launch work"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((item) => (
              <article key={item.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {item.workstream}
                    </div>
                    <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-semibold capitalize",
                      item.priority === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {permission?.canManage ? (
                    <select
                      aria-label={`Status for ${item.title}`}
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(item.id, event.target.value)
                      }
                      className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-xs capitalize"
                    >
                      {statuses
                        .filter(
                          (status) =>
                            !(item.approval_required && status === "approved"),
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
                  <span className="rounded-md bg-muted/50 px-2 py-1 text-[10px] capitalize">
                    {human(item.approval_status)}
                  </span>
                </div>
                {permission?.canManage &&
                  item.approval_required &&
                  !["pending", "approved"].includes(item.approval_status) && (
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
          </div>
        </>
      )}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project details and approvals</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                required
                value={profileForm.brand_name}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    brand_name: event.target.value,
                  })
                }
                placeholder="Brand name"
              />
              <Input
                value={profileForm.slogan}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, slogan: event.target.value })
                }
                placeholder="Slogan"
              />
            </div>
            <Textarea
              value={profileForm.service_summary}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  service_summary: event.target.value,
                })
              }
              placeholder="Plain-English service description"
            />
            <Textarea
              value={profileForm.business_plan}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  business_plan: event.target.value,
                })
              }
              placeholder="Business plan and milestones"
            />
            <Textarea
              value={profileForm.target_customers}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  target_customers: event.target.value,
                })
              }
              placeholder="Target customers and users"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={profileForm.payer_model}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    payer_model: event.target.value,
                  })
                }
                placeholder="Who pays"
              />
              <Input
                value={profileForm.pricing_summary}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    pricing_summary: event.target.value,
                  })
                }
                placeholder="Pricing summary"
              />
              <Input
                value={profileForm.legal_name}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    legal_name: event.target.value,
                  })
                }
                placeholder="Owning legal entity"
              />
              <select
                value={profileForm.primary_territory}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    primary_territory: event.target.value,
                  })
                }
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option>UK</option>
                <option>DE</option>
                <option>INT</option>
                <option>GROUP</option>
              </select>
              <StatusSelect
                label="Trademark"
                value={profileForm.trademark_status}
                onChange={(value) =>
                  setProfileForm({ ...profileForm, trademark_status: value })
                }
              />
              <StatusSelect
                label="UI/UX approval"
                value={profileForm.ui_ux_status}
                onChange={(value) =>
                  setProfileForm({ ...profileForm, ui_ux_status: value })
                }
              />
              <StatusSelect
                label="Feature approval"
                value={profileForm.features_status}
                onChange={(value) =>
                  setProfileForm({ ...profileForm, features_status: value })
                }
              />
            </div>
            <Button className="w-full" type="submit">
              Save project brief
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
      >
        <option value="not_checked">Not checked</option>
        <option value="not_started">Not started</option>
        <option value="in_progress">In progress</option>
        <option value="ready_for_review">Ready for review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </label>
  );
}
