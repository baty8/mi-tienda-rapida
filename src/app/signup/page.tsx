'use client';

import { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      // User is created, now insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, role: 'vendedor' });

      if (profileError) {
        setError(`Usuario creado, pero hubo un error al crear el perfil: ${profileError.message}`);
      } else {
        setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
        // Optionally redirect or just show the message
      }
    } else {
       // This case might happen if email confirmation is required and user object is not returned immediately
       setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear Cuenta</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
