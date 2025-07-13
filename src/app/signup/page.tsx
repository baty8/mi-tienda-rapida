
'use client';

import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(`Error al registrarse: ${signUpError.message}`);
      setLoading(false);
      return;
    }

    if (user) {
      // Bypass RLS to insert the profile for the new user.
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, role: 'vendedor' }, { returning: 'minimal' });
      
      if (profileError) {
        // This is a critical error, but the user is already created in auth.
        // We inform the user, but they might need support to fix their profile.
        setError(`Usuario creado, pero hubo un error al crear el perfil: ${profileError.message}`);
      } else {
        setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.');
      }
    } else {
       // This case might happen if email confirmation is required.
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
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
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
