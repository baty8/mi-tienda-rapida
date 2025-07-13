
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
        // Step 2: Fetch user profile to check the role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !profile) {
            toast({
                variant: 'destructive',
                title: 'Error de Perfil',
                description: 'No se pudo encontrar tu perfil. Contacta a soporte.',
            });
            // Redirect non-profile users to the main page
            router.push('/');
        } else {
            // Step 3: Redirect based on role
            if (profile.role === 'vendedro') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    }
    // No need to set loading to false here, as a redirect is happening.
    // However, if a redirect might not happen, it's good practice.
    // setLoading(false) will cause a flicker if a redirect is successful.
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="p-8 max-w-sm w-full bg-white rounded-xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 font-headline">Iniciar Sesión</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña:</Label>
            <Input
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <Link href="/signup" className="text-sm text-primary hover:underline">
            ¿No tienes una cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
