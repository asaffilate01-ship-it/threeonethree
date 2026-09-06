import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
}

export default function KpiCard({ label, value, subtitle, icon, trend }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="kpi-card"
    >
      <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">{value}</div>
      {subtitle && <div className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
          {trend.value}
        </div>
      )}
    </motion.div>
  );
}
