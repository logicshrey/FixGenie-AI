import Link from 'next/link';
import { ReactNode } from 'react';
import { auth, signOut } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Ticket, Wrench } from 'lucide-react';

type Props = {
  children: ReactNode;
  active?: 'dashboard' | 'tickets';
};

export async function TechnicianShell({ children, active }: Props) {
  await auth(); // middleware already restricts; this ensures session exists

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px,1fr]">
        <aside className="rounded-xl border bg-card p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Wrench className="h-4 w-4 text-primary" />
            FixGenie AI
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              TECH
            </span>
          </div>
          <nav className="space-y-1 text-sm">
            <NavItem
              href="/technician"
              active={active === 'dashboard'}
              icon={<LayoutDashboard className="h-4 w-4" />}
            >
              Assigned
            </NavItem>
            <NavItem
              href="/technician"
              active={active === 'tickets'}
              icon={<Ticket className="h-4 w-4" />}
            >
              Tickets
            </NavItem>
          </nav>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <ThemeToggle />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
          <div className="mt-4">
            <Link className="text-xs text-muted-foreground underline-offset-2 hover:underline" href="/dashboard">
              Switch to user view
            </Link>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}

function NavItem({
  href,
  active,
  icon,
  children,
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
        'flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted',
        active && 'bg-muted font-medium',
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

