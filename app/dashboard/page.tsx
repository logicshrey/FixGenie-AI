import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { UserShell } from '@/components/app-shell/user-shell';
import Link from 'next/link';
import { Ticket, TrendingUp, CheckCircle2, Plus, List, Bot } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [openCount, inProgressCount, resolvedCount] = await Promise.all([
    db.ticket.count({ where: { createdById: session.user.id as string, status: 'OPEN' } }),
    db.ticket.count({ where: { createdById: session.user.id as string, status: 'IN_PROGRESS' } }),
    db.ticket.count({ where: { createdById: session.user.id as string, status: 'RESOLVED' } }),
  ]);

  return (
    <UserShell active="dashboard">
      <div className="space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Welcome back,{' '}
            <span className="text-gradient">
              {session.user.name ?? 'User'}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&rsquo;s an overview of your maintenance activity.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Open Tickets"
            value={openCount}
            icon={<Ticket className="h-5 w-5" />}
            accent="text-sky-600 bg-sky-500/10 dark:text-sky-400"
            border="border-sky-500/20"
          />
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="text-violet-600 bg-violet-500/10 dark:text-violet-400"
            border="border-violet-500/20"
          />
          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
            border="border-emerald-500/20"
          />
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-border/60 bg-background/50 p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold">Quick Actions</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/tickets/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4" /> Create new ticket
            </Link>
            <Link
              href="/tickets"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-all"
            >
              <List className="h-4 w-4" /> View all tickets
            </Link>
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all"
            >
              <Bot className="h-4 w-4" /> Ask FixBot
            </Link>
          </div>
        </div>

      </div>
    </UserShell>
  );
}

function StatCard({
  label, value, icon, accent, border,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  border: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${border} bg-card p-6 hover:shadow-card transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-4xl font-black">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
