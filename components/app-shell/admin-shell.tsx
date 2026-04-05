import Link from 'next/link';
import { Wrench, LayoutDashboard, Ticket, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  active?: 'dashboard' | 'tickets' | 'technicians';
};

export function AdminShell({ children, active }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px,1fr]">
        <aside className="rounded-xl border bg-card p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Wrench className="h-4 w-4 text-primary" />
            FixGenie AI
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              ADMIN
            </span>
          </div>
          <nav className="space-y-1 text-sm">
            <NavItem href="/admin" active={active === 'dashboard'} icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </NavItem>
            <NavItem href="/admin/tickets" active={active === 'tickets'} icon={<Ticket className="h-4 w-4" />}>
              Tickets
            </NavItem>
            <NavItem
              href="/admin/technicians"
              active={active === 'technicians'}
              icon={<Users className="h-4 w-4" />}
            >
              Technicians
            </NavItem>
          </nav>
          <div className="mt-4 border-t pt-4">
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

