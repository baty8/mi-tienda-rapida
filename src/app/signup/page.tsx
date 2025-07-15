
'use client';

import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: error.message,
      });
      return;
    }

    // Check if we have a user and session
    if (data.user) {
      // 2. Create a profile for the new user. This is crucial.
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: 'vendedor',
        name: 'Vendedor' // Default name
      });

      if (profileError) {
        setLoading(false);
        // This is a critical error, but we should still inform the user to check their email.
        console.error('Failed to create profile:', profileError);
        toast({
          variant: 'destructive',
          title: 'Error de perfil',
          description: 'No se pudo crear el perfil. Contacta a soporte.',
        });
        return;
      }
      
      // If everything is successful
      toast({
        title: '¡Registro casi completo!',
        description: 'Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
      });
      router.push('/');

    } else {
       // This case might happen if user confirmation is required.
       toast({
        title: '¡Revisa tu correo!',
        description: 'Te hemos enviado un enlace de confirmación para activar tu cuenta.',
      });
      router.push('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 font-headline">Crear Cuenta</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/" className="font-medium text-primary hover:text-primary/80">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
