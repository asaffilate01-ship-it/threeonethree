import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Auth from '@/pages/Auth';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { signUp: vi.fn(), signInWithPassword: vi.fn() } },
}));

describe('development login helper', () => {
  it('pre-fills the development account', () => {
    render(<Auth />);
    fireEvent.click(screen.getByRole('button', { name: /fill dev admin login/i }));
    expect(screen.getByPlaceholderText('Email')).toHaveValue('admin@groupcontrol.app');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('Admin123!');
  });
});

