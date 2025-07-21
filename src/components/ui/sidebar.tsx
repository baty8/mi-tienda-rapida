
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  LineChart,
  User,
  BookOpen,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

const menuItems = [
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/dashboard', label: 'Dashboard', icon: LineChart },
  { href: '/catalog', label: 'Catálogo', icon: BookOpen },
  { href: '/finance', label: 'Finanzas', icon: TrendingUp },
  { href: '/profile', label: 'Perfil', icon: User },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  profile: Profile | null;
}

export function Sidebar({ profile, className }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    // La única responsabilidad del botón es cerrar la sesión.
    // El layout se encargará de la redirección al detectar el cambio de estado.
    // Esto evita conflictos y demoras.
    await supabase.auth.signOut();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'VR';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <aside className={cn("flex flex-col border-r bg-sidebar", className)}>
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6">
        <Link href="/products" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span>VentaRapida</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:text-sidebar-foreground hover:bg-sidebar-accent',
              pathname.startsWith(item.href) && 'bg-sidebar-accent text-sidebar-foreground font-semibold'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-3 p-4 border-t border-sidebar-border">
        <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "User avatar"} data-ai-hint="male user" />
            <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-sm font-medium leading-none text-sidebar-foreground">{profile?.name || 'Vendedor'}</p>
            <p className="text-xs leading-none text-sidebar-foreground/70">{profile?.email || ''}</p>
        </div>
      </div>
    </aside>
  );
}
