import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { AdminAccessGate, OperationsAccessGate } from '@/components/access/AccessGate';

let roles: string[] = [];

vi.mock('@/hooks/useOperationsWorkspace', () => ({
  useActionCentre: () => ({ data: [] }),
  useOperationsPermission: () => ({ data: { roles, canManage: roles.includes('admin') }, isLoading: false }),
}));

afterEach(() => {
  cleanup();
  roles = [];
});

describe('native mobile shell', () => {
  it('keeps the five high-frequency destinations in the mobile tab bar', () => {
    render(<MemoryRouter><MobileBottomNav /></MemoryRouter>);
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    for (const label of ['Today', 'Work', 'Quick', 'Alerts', 'More']) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('explains missing access and allows the correct staff roles', () => {
    roles = ['partner'];
    const { rerender } = render(<OperationsAccessGate><div>Operations</div></OperationsAccessGate>);
    expect(screen.getByText('Access needs updating')).toBeInTheDocument();

    roles = ['viewer'];
    rerender(<OperationsAccessGate><div>Operations</div></OperationsAccessGate>);
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('reserves User Management for administrators', () => {
    roles = ['project_manager'];
    const { rerender } = render(<AdminAccessGate><div>User management</div></AdminAccessGate>);
    expect(screen.getByText('Only administrators can manage users and roles.')).toBeInTheDocument();

    roles = ['admin'];
    rerender(<AdminAccessGate><div>User management</div></AdminAccessGate>);
    expect(screen.getByText('User management')).toBeInTheDocument();
  });
});
