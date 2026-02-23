import { cn } from '@/lib/utils';

interface ReadinessBarProps {
  percent: number;
  size?: 'sm' | 'md';
}

export default function ReadinessBar({ percent, size = 'sm' }: ReadinessBarProps) {
  const getColor = () => {
    if (percent >= 80) return 'bg-success';
    if (percent >= 50) return 'bg-warning';
    if (percent >= 25) return 'bg-info';
    return 'bg-muted-foreground';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full bg-muted overflow-hidden", size === 'sm' ? 'w-16 h-1.5' : 'w-24 h-2')}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">{percent}%</span>
    </div>
  );
}
