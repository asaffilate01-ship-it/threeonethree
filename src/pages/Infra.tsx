import { motion } from 'framer-motion';
import { useDomains, useHosting, useEmailServices, useSslCertificates } from '@/hooks/useProjectData';
import { Globe, Server, Mail, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Infra() {
  const { data: domains, isLoading: dLoading } = useDomains();
  const { data: hosting, isLoading: hLoading } = useHosting();
  const { data: emailServices, isLoading: eLoading } = useEmailServices();
  const { data: sslCerts, isLoading: sLoading } = useSslCertificates();

  if (dLoading || hLoading || eLoading || sLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  const BoolIcon = ({ val }: { val: boolean | null }) => val
    ? <CheckCircle2 size={14} className="text-success" />
    : <XCircle size={14} className="text-muted-foreground" />;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Domains & Infrastructure</h1>
        <p className="text-sm text-muted-foreground mt-1">Domain, hosting, email & SSL tracking across all projects</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <Globe size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{(domains || []).length}</div>
          <div className="text-xs text-muted-foreground">Domains</div>
        </div>
        <div className="kpi-card">
          <Server size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{(hosting || []).length}</div>
          <div className="text-xs text-muted-foreground">Hosting Entries</div>
        </div>
        <div className="kpi-card">
          <Mail size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{(emailServices || []).length}</div>
          <div className="text-xs text-muted-foreground">Email Services</div>
        </div>
        <div className="kpi-card">
          <Shield size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{(sslCerts || []).length}</div>
          <div className="text-xs text-muted-foreground">SSL Certificates</div>
        </div>
      </div>

      {/* Domains */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Registered Domains</h3>
        {(domains || []).length > 0 ? (
          <div className="space-y-2">
            {(domains || []).map(domain => (
              <div key={domain.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{domain.domain_name}</div>
                    <div className="text-xs text-muted-foreground">{(domain as any).projects?.name} · {domain.registrar || 'No registrar set'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {domain.renew_date && (
                    <span className="text-xs text-muted-foreground">Renews {domain.renew_date}</span>
                  )}
                  {domain.annual_cost_gbp && (
                    <span className="text-xs text-muted-foreground">£{Number(domain.annual_cost_gbp)}/yr</span>
                  )}
                  <span className={cn("text-xs px-2 py-0.5 rounded font-medium", 
                    domain.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  )}>{domain.status || 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-6">No domains registered yet</div>
        )}
      </motion.div>

      {/* Hosting */}
      {(hosting || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Hosting</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Provider</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Environment</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {(hosting || []).map(h => (
                <tr key={h.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{h.provider}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{(h as any).projects?.code}</td>
                  <td className="px-5 py-3"><span className="text-xs capitalize bg-muted px-2 py-0.5 rounded text-muted-foreground">{h.environment}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground capitalize">{h.hosting_type || '—'}</td>
                  <td className="px-5 py-3 text-right text-sm text-foreground">{h.monthly_cost_gbp ? `£${Number(h.monthly_cost_gbp)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Email Services */}
      {(emailServices || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Email Services</h3>
          <div className="space-y-3">
            {(emailServices || []).map(e => (
              <div key={e.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <div className="text-sm font-medium text-foreground">{e.provider}</div>
                  <div className="text-xs text-muted-foreground">{(e as any).projects?.name} · {e.primary_domain || 'No domain set'}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1"><BoolIcon val={e.spf_configured} /><span className="text-[10px] text-muted-foreground">SPF</span></div>
                    <div className="flex items-center gap-1"><BoolIcon val={e.dkim_configured} /><span className="text-[10px] text-muted-foreground">DKIM</span></div>
                    <div className="flex items-center gap-1"><BoolIcon val={e.dmarc_configured} /><span className="text-[10px] text-muted-foreground">DMARC</span></div>
                  </div>
                  {e.monthly_cost_gbp && <span className="text-xs text-muted-foreground">£{Number(e.monthly_cost_gbp)}/mo</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SSL Certificates */}
      {(sslCerts || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">SSL Certificates</h3>
          <div className="space-y-3">
            {(sslCerts || []).map(cert => (
              <div key={cert.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <Shield size={16} className={cert.is_active ? "text-success" : "text-destructive"} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{(cert as any).domains?.domain_name}</div>
                    <div className="text-xs text-muted-foreground">{cert.provider || 'Unknown provider'} · {cert.is_free ? 'Free' : 'Paid'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cert.expiry_date && <span className="text-xs text-muted-foreground">Expires {cert.expiry_date}</span>}
                  <span className={cn("text-xs px-2 py-0.5 rounded font-medium",
                    cert.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>{cert.is_active ? 'Active' : 'Expired'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
