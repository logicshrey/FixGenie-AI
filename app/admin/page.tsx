import { auth, signOut } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from '@/components/admin/overview-chart';
import Link from 'next/link';
import { AdminShell } from '@/components/app-shell/admin-shell';
import { Button } from '@/components/ui/button';
import { Ticket, Users } from 'lucide-react';
import { SimpleBarChart } from '@/components/admin/simple-bar-chart';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  const [total, byStatus, byCategory, byPriority, resolvedTickets] = await Promise.all([
    db.ticket.count(),
    db.ticket.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    db.ticket.groupBy({
      by: ['category'],
      _count: { _all: true },
    }),
    db.ticket.groupBy({
      by: ['priority'],
      _count: { _all: true },
    }),
    db.ticket.findMany({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      take: 200,
      orderBy: { updatedAt: 'desc' },
      select: { createdAt: true, updatedAt: true },
    }),
  ]);

  const chartData = byStatus.map((s) => ({
    status: s.status,
    count: s._count._all,
  }));

  const categoryData = byCategory
    .map((c) => ({ label: c.category, value: c._count._all }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const priorityData = byPriority
    .map((p) => ({ label: p.priority, value: p._count._all }))
    .sort((a, b) => b.value - a.value);

  const avgResolutionHours =
    resolvedTickets.length === 0
      ? null
      : Math.round(
          resolvedTickets.reduce((acc, t) => {
            const diffMs = t.updatedAt.getTime() - t.createdAt.getTime();
            return acc + diffMs / (1000 * 60 * 60);
          }, 0) / resolvedTickets.length,
        );

  return (
    <AdminShell active="dashboard">
      <main className="mx-auto max-w-6xl px-4 py-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage technicians, assign tickets, and track operational health.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/tickets">
              <Button variant="outline" className="gap-2">
                <Ticket className="h-4 w-4" />
                View tickets
              </Button>
            </Link>
            <Link href="/admin/technicians">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Manage techs
              </Button>
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button type="submit" variant="secondary">
                Logout
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {chartData.find((d) => d.status === 'OPEN')?.count ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {chartData.find((d) => d.status === 'RESOLVED')?.count ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg resolution time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {avgResolutionHours === null ? '—' : `${avgResolutionHours}h`}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on recent resolved/closed tickets.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tickets by status</CardTitle>
                <Link
                  href="/admin/tickets"
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Open tickets list →
                </Link>
              </CardHeader>
              <CardContent>
                <OverviewChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tickets by priority</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={priorityData} color="#f97316" />
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Top categories</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={categoryData} color="#22c55e" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

