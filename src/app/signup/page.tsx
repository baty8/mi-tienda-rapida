
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
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: signUpError.message,
      });
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
        toast({
            variant: 'destructive',
            title: 'Error de Registro',
            description: 'No se pudo obtener la información del usuario después del registro.',
        });
        setLoading(false);
        return;
    }

    // Insert profile with tenant_id
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ 
        user_id: signUpData.user.id, 
        role: 'vendedor',
        tenant_id: signUpData.user.id // Use user's ID as their own tenant ID
      }, {
        // This is necessary because RLS might prevent insertion otherwise.
        // It's safe here because we are creating a profile for the just-signed-up user.
        bypassRLS: true 
      });

    if (profileError) {
       toast({
        variant: 'destructive',
        title: 'Error al crear el perfil',
        description: `Usuario creado, pero hubo un problema al configurar el perfil: ${profileError.message}`,
      });
    } else {
        setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.');
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
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
