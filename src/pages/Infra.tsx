import { motion } from 'framer-motion';
import { PROJECTS } from '@/data/mockData';
import { Globe, Server, Mail, Shield } from 'lucide-react';

export default function Infra() {
  const domainsProjects = PROJECTS.filter(p => p.domain);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Domains & Infrastructure</h1>
        <p className="text-sm text-muted-foreground mt-1">Domain, hosting, email & SSL tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card">
          <Globe size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{domainsProjects.length}</div>
          <div className="text-xs text-muted-foreground">Domains</div>
        </div>
        <div className="kpi-card">
          <Server size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">—</div>
          <div className="text-xs text-muted-foreground">Hosting</div>
        </div>
        <div className="kpi-card">
          <Mail size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">—</div>
          <div className="text-xs text-muted-foreground">Email Services</div>
        </div>
        <div className="kpi-card">
          <Shield size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">—</div>
          <div className="text-xs text-muted-foreground">SSL Certs</div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Registered Domains</h3>
        <div className="space-y-3">
          {domainsProjects.map(project => (
            <div key={project.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">{project.domain}</div>
                  <div className="text-xs text-muted-foreground">{project.name}</div>
                </div>
              </div>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded font-medium">Active</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
