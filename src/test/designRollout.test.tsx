import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DesignRollout from '@/pages/DesignRollout';
import { designPortfolioSnapshot } from '@/data/designPortfolioSnapshot';

afterEach(cleanup);

describe('portfolio design rollout register', () => {
  it('preserves 44 distinct PR references across both waves', () => {
    const entries = designPortfolioSnapshot.entries;
    expect(entries.length).toBe(44);
    expect(entries.filter((entry) => entry.wave === 1)).toHaveLength(21);
    expect(entries.filter((entry) => entry.wave === 2)).toHaveLength(23);
    expect(new Set(entries.map((entry) => entry.repo + '#' + entry.pr)).size).toBe(entries.length);
    expect(entries.filter((entry) => entry.uiCodeChange)).toHaveLength(6);
  });

  it('distinguishes a historical snapshot from a live deployment claim', () => {
    render(<DesignRollout />);
    expect(screen.getByRole('heading', { name: 'Design rollout register' })).toBeInTheDocument();
    expect(screen.getByText(/not a live GitHub status feed/i)).toBeInTheDocument();
    expect(screen.getByText(/historical pull-request reference/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /pull request #/i })).toHaveLength(44);
  });

  it('filters by brand, wave and actual UI source changes and recovers an empty result', () => {
    render(<DesignRollout />);
    const input = screen.getByRole('searchbox', { name: 'Product, repository or PR number' });
    fireEvent.change(input, { target: { value: 'TaxNuvia' } });
    expect(screen.getAllByRole('link', { name: /pull request #/i })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Wave 1' }));
    expect(screen.getByText('No matching projects')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show all projects' }));
    fireEvent.click(screen.getByRole('button', { name: 'UI source' }));
    expect(screen.getAllByRole('link', { name: /pull request #/i })).toHaveLength(6);
  });

  it('uses safe, distinct external GitHub PR links', () => {
    render(<DesignRollout />);
    const links = screen.getAllByRole('link', { name: /pull request #/i });
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(44);
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^https:\/\/github\.com\/asaffilate01-ship-it\/[\w.-]+\/pull\/\d+$/);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
