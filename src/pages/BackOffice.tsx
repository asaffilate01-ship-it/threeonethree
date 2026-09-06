import { FormEvent, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  LockKeyhole,
  Plus,
  ReceiptText,
  UsersRound,
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
import { useBackOffice } from "@/hooks/useLifecycle";
import { useOperationsPermission } from "@/hooks/useOperationsWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type FunctionArea = "administration" | "finance" | "hr";
const statuses = [
  "not_started",
  "in_progress",
  "waiting_external",
  "review",
  "complete",
  "blocked",
  "not_applicable",
];
const emptyForm = {
  function_area: "administration" as FunctionArea,
  title: "",
  description: "",
  entity_name: "",
  territory: "GROUP",
  priority: "medium",
  due_date: "",
  recurrence: "",
  amount: "",
  currency: "GBP",
  confidential: false,
  evidence_url: "",
};
const areaMeta = {
  administration: {
    label: "Administration",
    icon: BriefcaseBusiness,
    description:
      "Entities, statutory records, domains, insurance, suppliers and renewals",
  },
  finance: {
    label: "Finance",
    icon: ReceiptText,
    description:
      "Bookkeeping, tax, payroll, cash, billing, reconciliations and reporting",
  },
  hr: {
    label: "HR & People",
    icon: UsersRound,
    description:
      "Recruitment, contracts, checks, onboarding, training, performance and leavers",
  },
};

function human(value: string) {
  return value.replaceAll("_", " ");
}

export default function BackOffice() {
  const { data: items = [], isLoading, error } = useBackOffice();
  const { data: permission } = useOperationsPermission();
  const financeOnly =
    permission?.roles.includes("finance") &&
    !permission.roles.some((role) =>
      ["admin", "project_manager"].includes(role),
    );
  const areas: FunctionArea[] = financeOnly
    ? ["finance"]
    : ["administration", "finance", "hr"];
  const [area, setArea] = useState<FunctionArea>(
    financeOnly ? "finance" : "administration",
  );
  const activeArea = areas.includes(area) ? area : areas[0];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const filtered = useMemo(
    () => items.filter((item) => item.function_area === activeArea),
    [activeArea, items],
  );
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["back-office"] });

  const createItem = async (event: FormEvent) => {
    event.preventDefault();
    const { error: createError } = await supabase
      .from("back_office_items")
      .insert({
        ...form,
        function_area: activeArea,
        entity_name: form.entity_name || null,
        due_date: form.due_date || null,
        recurrence: form.recurrence || null,
        amount: form.amount ? Number(form.amount) : null,
        evidence_url: form.evidence_url || null,
      });
    if (createError) return toast.error(createError.message);
    setForm({ ...emptyForm, function_area: activeArea });
    setOpen(false);
    refresh();
    toast.success("Back-office action created");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error: updateError } = await supabase
      .from("back_office_items")
      .update({ status })
      .eq("id", id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  if (isLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading back office…
      </div>
    );
  if (error)
    return (
      <div className="text-sm text-destructive">
        Back office could not load: {error.message}
      </div>
    );

  const overdue = filtered.filter(
    (item) =>
      item.due_date &&
      new Date(`${item.due_date}T23:59:59`) < new Date() &&
      item.status !== "complete",
  ).length;
  const confidential = filtered.filter((item) => item.confidential).length;
  const AreaIcon = areaMeta[activeArea].icon;

  return (
    <div className="max-w-7xl space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Internal corporate operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Administration, finance and HR
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Controlled responsibilities, deadlines, evidence and recurring
            obligations for the group.
          </p>
        </div>
        {permission?.canManage && (
          <Button
            className="min-h-10 shrink-0"
            onClick={() => {
              setForm({ ...emptyForm, function_area: activeArea });
              setOpen(true);
            }}
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        )}
      </header>

      <div className="native-scroll flex gap-2 overflow-x-auto">
        {areas.map((item) => {
          const Icon = areaMeta[item].icon;
          return (
            <button
              key={item}
              onClick={() => setArea(item)}
              className={cn(
                "min-w-44 rounded-2xl border p-4 text-left",
                activeArea === item
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/50 bg-muted/10",
              )}
            >
              <Icon size={18} className="text-primary" />
              <div className="mt-3 text-sm font-semibold">
                {areaMeta[item].label}
              </div>
              <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                {areaMeta[item].description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4">
          <AreaIcon size={17} className="text-primary" />
          <div className="mt-3 text-2xl font-bold">{filtered.length}</div>
          <div className="text-xs text-muted-foreground">Open register</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <CalendarClock size={17} className="text-primary" />
          <div className="mt-3 text-2xl font-bold">{overdue}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <LockKeyhole size={17} className="text-primary" />
          <div className="mt-3 text-2xl font-bold">{confidential}</div>
          <div className="text-xs text-muted-foreground">Confidential</div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((item) => (
          <article key={item.id} className="glass-card rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.entity_name || item.territory}
                </div>
                <h2 className="mt-1 text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description || "No description recorded"}
                </p>
              </div>
              {item.confidential && (
                <LockKeyhole size={15} className="shrink-0 text-amber-400" />
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-medium">Due / recurrence</div>
                <div className="text-muted-foreground">
                  {item.due_date || item.recurrence || "Not scheduled"}
                </div>
              </div>
              <div>
                <div className="font-medium">Amount</div>
                <div className="text-muted-foreground">
                  {item.amount === null
                    ? "Not applicable"
                    : `${item.currency} ${item.amount.toLocaleString()}`}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {permission?.canManage ? (
                <select
                  aria-label={`Status for ${item.title}`}
                  value={item.status}
                  onChange={(event) =>
                    updateStatus(item.id, event.target.value)
                  }
                  className="min-h-10 flex-1 rounded-lg border border-border bg-background px-2 text-xs capitalize"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {human(status)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs capitalize">{human(item.status)}</span>
              )}
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
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add {areaMeta[activeArea].label} action</DialogTitle>
          </DialogHeader>
          <form onSubmit={createItem} className="space-y-3">
            <Input
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Required action or obligation"
            />
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Scope, outcome and acceptance evidence"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={form.entity_name}
                onChange={(event) =>
                  setForm({ ...form, entity_name: event.target.value })
                }
                placeholder="Entity or employer"
              />
              <select
                value={form.territory}
                onChange={(event) =>
                  setForm({ ...form, territory: event.target.value })
                }
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option>UK</option>
                <option>DE</option>
                <option>INT</option>
                <option>GROUP</option>
              </select>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm capitalize"
              >
                <option>low</option>
                <option>medium</option>
                <option>high</option>
                <option>critical</option>
              </select>
              <Input
                type="date"
                value={form.due_date}
                onChange={(event) =>
                  setForm({ ...form, due_date: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={form.recurrence}
                onChange={(event) =>
                  setForm({ ...form, recurrence: event.target.value })
                }
                placeholder="Recurrence, e.g. monthly"
              />
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="Amount"
              />
            </div>
            <Input
              type="url"
              value={form.evidence_url}
              onChange={(event) =>
                setForm({ ...form, evidence_url: event.target.value })
              }
              placeholder="Secure evidence URL"
            />
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border/50 px-3 text-xs">
              <input
                type="checkbox"
                checked={form.confidential}
                onChange={(event) =>
                  setForm({ ...form, confidential: event.target.checked })
                }
              />
              Contains confidential information
            </label>
            <Button className="w-full" type="submit">
              Create action
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
