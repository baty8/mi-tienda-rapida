
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/products');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      });
      setLoading(false);
      return;
    }
    
    setLoading(false);
    toast({
        title: '¡Bienvenido de nuevo!',
        description: 'Redirigiendo a tu panel de productos.',
    });
    router.push('/products');
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Iniciar Sesión</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa tu correo para acceder a tu panel de vendedor
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
               />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center p-8">
         <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-primary mb-6" />
            <h2 className="text-4xl font-bold font-headline text-gray-800">Bienvenido a VentaRapida</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
                Crea tu catálogo, administra tus productos y publícalo en la red para obtener ventas al instante.
            </p>
            <Image
                src="https://placehold.co/600x400.png"
                alt="Image"
                width="1920"
                height="1080"
                className="h-auto w-full max-w-md mx-auto rounded-lg object-cover mt-8 shadow-2xl"
                data-ai-hint="online store analytics"
            />
         </div>
      </div>
    </div>
  )
}
