export function hasOperationsWriteAccess(roles: string[]) {
  return roles.some((role) => role === 'admin' || role === 'project_manager');
}

export function getActionUrgency(date: string | null, now = new Date()) {
  if (!date) return { label: 'Schedule', style: 'bg-muted text-muted-foreground', order: 3 };
  const dueDate = new Date(`${date}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, style: 'bg-red-500/10 text-red-400', order: 0 };
  if (days <= 7) return { label: days === 0 ? 'Due today' : `Due in ${days}d`, style: 'bg-amber-500/10 text-amber-400', order: 1 };
  return { label: `Due ${date}`, style: 'bg-blue-500/10 text-blue-400', order: 2 };
}
