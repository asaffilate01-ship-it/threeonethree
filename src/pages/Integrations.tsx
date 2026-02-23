export default function Integrations() {
  const integrations = [
    { name: 'Stripe', category: 'Payments', vendor: 'Stripe', projects: 4 },
    { name: 'SendGrid', category: 'Email', vendor: 'Twilio', projects: 6 },
    { name: 'Twilio SMS', category: 'SMS', vendor: 'Twilio', projects: 2 },
    { name: 'OpenAI', category: 'AI', vendor: 'OpenAI', projects: 3 },
    { name: 'Google Analytics', category: 'Analytics', vendor: 'Google', projects: 8 },
    { name: 'Cloudflare', category: 'Other', vendor: 'Cloudflare', projects: 5 },
    { name: 'WhatsApp Business', category: 'WhatsApp', vendor: 'Meta', projects: 1 },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Third-party services and APIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(int => (
          <div key={int.name} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">{int.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{int.vendor}</div>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{int.category}</span>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Used in {int.projects} projects</div>
          </div>
        ))}
      </div>
    </div>
  );
}
