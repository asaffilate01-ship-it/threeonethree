import { STAGE_COLORS, STAGE_LABELS, ProjectStage } from '@/types/project';
import { cn } from '@/lib/utils';

export default function StageBadge({ stage }: { stage: ProjectStage }) {
  return (
    <span className={cn('stage-badge', STAGE_COLORS[stage])}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
