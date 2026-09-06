import { describe, expect, it } from 'vitest';
import { getActionUrgency, hasAdminAccess, hasBackOfficeReadAccess, hasOperationsReadAccess, hasOperationsWriteAccess } from '@/lib/operationsWorkspace';

describe('operations workspace controls', () => {
  it('only gives operations write access to administrators and project managers', () => {
    expect(hasOperationsWriteAccess(['admin'])).toBe(true);
    expect(hasOperationsWriteAccess(['project_manager'])).toBe(true);
    expect(hasOperationsWriteAccess(['finance'])).toBe(false);
    expect(hasOperationsWriteAccess(['partner'])).toBe(false);
  });

  it('keeps staff reading and administration separate from partner access', () => {
    expect(hasOperationsReadAccess(['viewer'])).toBe(true);
    expect(hasOperationsReadAccess(['finance'])).toBe(true);
    expect(hasOperationsReadAccess(['partner'])).toBe(false);
    expect(hasAdminAccess(['project_manager'])).toBe(false);
    expect(hasAdminAccess(['admin'])).toBe(true);
  });

  it('restricts the back office to management and finance roles', () => {
    expect(hasBackOfficeReadAccess(['finance'])).toBe(true);
    expect(hasBackOfficeReadAccess(['project_manager'])).toBe(true);
    expect(hasBackOfficeReadAccess(['viewer'])).toBe(false);
    expect(hasBackOfficeReadAccess(['partner'])).toBe(false);
  });

  it('orders overdue, upcoming, future and unscheduled work correctly', () => {
    const now = new Date('2026-09-06T12:00:00');
    expect(getActionUrgency('2026-09-05', now).order).toBe(0);
    expect(getActionUrgency('2026-09-06', now).label).toBe('Due today');
    expect(getActionUrgency('2026-09-10', now).order).toBe(1);
    expect(getActionUrgency('2026-10-01', now).order).toBe(2);
    expect(getActionUrgency(null, now).order).toBe(3);
  });
});
