import Link from 'next/link';
import { ReactNode } from 'react';
import { auth, signOut } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Bot, LayoutDashboard, Ticket, Wrench, LogOut, ShieldAlert, Hammer } from 'lucide-react';

type Props = {
  children: ReactNode;
  active?: 'dashboard' | 'tickets' | 'chat';
};

export async function UserShell({ children, active }: Props) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Mobile top-bar (visible below md) ── */}
      <div className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <span className="font-black tracking-tight">FixGenie AI</span>
        </div>
        <div className="flex items-center gap-1">
          <MobileNavLink href="/dashboard" active={active === 'dashboard'} label="Dashboard" />
          <MobileNavLink href="/tickets"   active={active === 'tickets'}   label="Tickets" />
          <MobileNavLink href="/chat"      active={active === 'chat'}      label="Chat" />
        </div>
      </div>

      {/* ── Desktop two-column layout ── */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 p-4 md:grid-cols-[260px,1fr] md:p-4 lg:gap-6 lg:p-6">

        {/* ── Sidebar (desktop only) ── */}
        <aside className="relative hidden flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-card md:sticky md:top-6 md:flex md:h-[calc(100vh-3rem)]">
          {/* Subtle ambient glow */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-[60px]" />

          {/* Brand */}
          <div className="relative mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow-sm">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight">FixGenie AI</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                {session?.user?.role ?? 'USER'}
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="relative flex-1 space-y-1">
            <NavItem href="/dashboard" active={active === 'dashboard'} icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavItem>
            <NavItem href="/tickets"   active={active === 'tickets'}   icon={<Ticket className="h-4 w-4" />}>Tickets</NavItem>
            <NavItem href="/chat"      active={active === 'chat'}      icon={<Bot className="h-4 w-4" />}>FixBot Chat</NavItem>
          </nav>

          {/* Role-specific links */}
          <div className="relative mt-4 space-y-2">
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-600 transition-all hover:bg-amber-500/20 dark:text-amber-400"
              >
                <ShieldAlert className="h-4 w-4" /> Go to Admin →
              </Link>
            )}
            {session?.user?.role === 'TECHNICIAN' && (
              <Link
                href="/technician"
                className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-600 transition-all hover:bg-cyan-500/20 dark:text-cyan-400"
              >
                <Hammer className="h-4 w-4" /> Go to Technician →
              </Link>
            )}
          </div>

          {/* Bottom bar */}
          <div className="relative mt-5 flex items-center justify-between border-t border-border/50 pt-5">
            <ThemeToggle />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </form>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card md:min-h-[calc(100vh-3rem)]">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </section>

      </div>
    </div>
  );
}

function NavItem({
  href, active, icon, children,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span className={cn('transition-transform duration-200 group-hover:scale-110', active && 'text-primary')}>
        {icon}
      </span>
      <span>{children}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </Link>
  );
}

function MobileNavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {label}
    </Link>
  );
}
