
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import supabase from '@/lib/supabaseClient';

const menuItems = [
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/dashboard', label: 'Dashboard', icon: LineChart },
  { href: '/catalog', label: 'Catálogo', icon: BookOpen },
  { href: '/finance', label: 'Finanzas', icon: TrendingUp },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center justify-center border-b">
        <Link href="/products" className="flex items-center gap-2 font-bold text-lg text-primary">
          <ShoppingBag className="h-6 w-6" />
          <span>VentaRapida</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
              pathname.startsWith(item.href) && 'bg-accent text-primary font-semibold'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
      <div className="flex items-center gap-3 p-4 border-t">
        <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40" alt="User avatar" data-ai-hint="male user" />
            <AvatarFallback>VR</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-sm font-medium leading-none">Admin</p>
            <p className="text-xs leading-none text-muted-foreground">admin@ventarapida.com</p>
        </div>
      </div>
    </aside>
  );
}
