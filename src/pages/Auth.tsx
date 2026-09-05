import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created! You are now signed in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Group Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? 'Create your account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-muted/30 border-border/50"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-muted/30 border-border/50"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading…' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Dev quick login */}
        {import.meta.env.DEV && (
          <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Development only</div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@groupcontrol.app');
                setPassword('Admin123!');
                setIsSignUp(false);
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Pre-fill the local development account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
              Fill dev admin login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
