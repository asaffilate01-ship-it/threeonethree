import { useMemo, useState } from 'react';
import { ExternalLink, Filter, Search, ShieldCheck, LayoutPanelTop, FileText } from 'lucide-react';
import { designPortfolioSnapshot } from '@/data/designPortfolioSnapshot';
import { cn } from '@/lib/utils';

type Coverage = 'all' | 'ui' | 'guidance';
type Wave = 'all' | '1' | '2';

const records = designPortfolioSnapshot.entries;
const totalWithUiCode = records.filter((entry) => entry.uiCodeChange).length;

export default function DesignRollout() {
  const [query, setQuery] = useState('');
  const [wave, setWave] = useState<Wave>('all');
  const [coverage, setCoverage] = useState<Coverage>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('en-GB');
    return records.filter((entry) => {
      const matchesSearch = !term ||
        entry.brand.toLocaleLowerCase('en-GB').includes(term) ||
        entry.repo.toLocaleLowerCase('en-GB').includes(term) ||
        String(entry.pr).includes(term);
      const matchesWave = wave === 'all' || entry.wave === Number(wave);
      const matchesCoverage = coverage === 'all' ||
        (coverage === 'ui' ? entry.uiCodeChange : !entry.uiCodeChange);
      return matchesSearch && matchesWave && matchesCoverage;
    });
  }, [query, wave, coverage]);

  const reset = () => {
    setQuery('');
    setWave('all');
    setCoverage('all');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Portfolio operations</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Design rollout register</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Search the design-system pull requests recorded on {designPortfolioSnapshot.recordedAt}.
          This is a committed snapshot, not a live GitHub status feed or a list of deployed sites.
        </p>
      </header>

      <section aria-label="Recorded coverage" className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" size={16} /> Recorded PRs</div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{records.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across two design-adoption waves</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><LayoutPanelTop aria-hidden="true" size={16} /> UI source touched</div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{totalWithUiCode}</p>
          <p className="mt-1 text-xs text-muted-foreground">Source edits, not verified live deployments</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText aria-hidden="true" size={16} /> Guidance only</div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{records.length - totalWithUiCode}</p>
          <p className="mt-1 text-xs text-muted-foreground">Design standards and advisory checks</p>
        </div>
      </section>

      <section aria-labelledby="design-rollout-filters" className="rounded-xl border border-border/70 bg-card p-4">
        <h2 id="design-rollout-filters" className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Filter aria-hidden="true" size={16} /> Find a project
        </h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="design-rollout-search" className="text-xs font-medium text-foreground">Product, repository or PR number</label>
            <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Search aria-hidden="true" size={17} className="shrink-0 text-muted-foreground" />
              <input
                id="design-rollout-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by brand or repository"
                className="w-full min-w-0 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Wave</p>
            <div role="group" aria-label="Filter by rollout wave" className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
              {([['all', 'All'], ['1', 'Wave 1'], ['2', 'Wave 2']] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={wave === value} onClick={() => setWave(value)}
                  className={cn('min-h-10 rounded-md px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    wave === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/70')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Change scope</p>
            <div role="group" aria-label="Filter by change scope" className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
              {([['all', 'All'], ['ui', 'UI source'], ['guidance', 'Guidance']] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={coverage === value} onClick={() => setCoverage(value)}
                  className={cn('min-h-10 rounded-md px-3 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    coverage === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/70')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Design rollout pull requests" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            Showing <strong className="font-semibold text-foreground">{filtered.length}</strong> of {records.length} recorded PRs
          </p>
          {(query || wave !== 'all' || coverage !== 'all') && (
            <button type="button" onClick={reset} className="min-h-10 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <h3 className="font-semibold">No matching projects</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try another brand, repository or wave.</p>
            <button type="button" onClick={reset} className="mt-4 min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Show all projects
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((entry) => (
              <article key={entry.repo + '#' + entry.pr} className="flex min-w-0 flex-col rounded-xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-base font-semibold text-foreground">{entry.brand}</h3>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Wave {entry.wave}</span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{entry.repo}</p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {entry.uiCodeChange ? 'Includes a UI source change and design guidance' : 'Design guidance and advisory audit only'}
                </p>
                <a
                  href={`https://github.com/${entry.repo}/pull/${entry.pr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label={`Open ${entry.brand} pull request #${entry.pr} in GitHub (new tab)`}
                >
                  Review PR #{entry.pr} <ExternalLink aria-hidden="true" size={15} />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="rounded-lg border border-border/70 bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
        <strong>Release note:</strong> Every record is a historical pull-request reference.
        Neither the listed PR nor an advisory design scan confirms passing production checks,
        a merge, a deployment, or completed browser and accessibility acceptance.
        Use the GitHub link for the current state.
      </p>
    </div>
  );
}
