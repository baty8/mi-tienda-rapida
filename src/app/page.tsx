
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
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
      email: loginEmail,
      password: loginPassword,
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
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

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: 'vendedor',
        name: signupName || 'Vendedor'
      });

      if (profileError) {
        setLoading(false);
        console.error('Failed to create profile:', profileError);
        toast({
          variant: 'destructive',
          title: 'Error de perfil',
          description: 'No se pudo crear el perfil. Contacta a soporte.',
        });
        return;
      }
      
      toast({
        title: '¡Registro casi completo!',
        description: 'Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
      });
      setIsSignUp(false); // Switch back to sign-in panel

    } else {
       toast({
        title: '¡Revisa tu correo!',
        description: 'Te hemos enviado un enlace de confirmación para activar tu cuenta.',
      });
      setIsSignUp(false); // Switch back to sign-in panel
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-body">
      <div className={cn(
        'relative w-full max-w-4xl min-h-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-700 ease-in-out',
      )}>
        {/* Sign-Up Form Container */}
        <div className={cn(
            'absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out',
            isSignUp ? 'translate-x-full opacity-100 z-50' : 'opacity-0 z-10'
        )}>
           <form onSubmit={handleSignUp} className="flex h-full flex-col items-center justify-center gap-4 bg-white px-10 text-center">
            <h1 className="text-3xl font-bold font-headline text-gray-800">Crear Cuenta</h1>
             <span className="text-sm text-gray-500">Usa tu email para registrarte</span>
            <Input type="text" placeholder="Nombre" value={signupName} onChange={e => setSignupName(e.target.value)} required className="bg-gray-100 border-none" />
            <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="bg-gray-100 border-none" autoComplete="email"/>
            <Input type="password" placeholder="Contraseña" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="bg-gray-100 border-none" autoComplete="new-password"/>
            <Button type="submit" disabled={loading} className="mt-2 rounded-full bg-rose-500 px-12 py-2 font-bold uppercase tracking-wider text-white hover:bg-rose-600">
              {loading ? 'Creando...' : 'Registrarse'}
            </Button>
          </form>
        </div>

        {/* Sign-In Form Container */}
        <div className={cn(
            'absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out',
            isSignUp ? '-translate-x-full opacity-0 z-10' : 'translate-x-0 opacity-100 z-50'
        )}>
           <form onSubmit={handleLogin} className="flex h-full flex-col items-center justify-center gap-4 bg-white px-10 text-center">
            <h1 className="text-3xl font-bold font-headline text-gray-800">Iniciar Sesión</h1>
            <span className="text-sm text-gray-500">Usa tu cuenta para acceder</span>
            <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="bg-gray-100 border-none" autoComplete="email"/>
            <Input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="bg-gray-100 border-none" autoComplete="current-password"/>
             <Link href="#" className="text-sm text-gray-500 hover:underline">¿Olvidaste tu contraseña?</Link>
            <Button type="submit" disabled={loading} className="mt-2 rounded-full bg-rose-500 px-12 py-2 font-bold uppercase tracking-wider text-white hover:bg-rose-600">
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={cn(
            'absolute top-0 left-1/2 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-40',
             isSignUp ? '-translate-x-full' : 'translate-x-0'
        )}>
            <div className={cn(
                'relative h-full w-[200%] bg-gradient-to-r from-rose-500 to-red-600 text-white transition-transform duration-700 ease-in-out',
                 isSignUp ? 'translate-x-1/2' : '-translate-x-0'
            )}>
                 {/* Overlay Left */}
                <div className={cn(
                    'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-700 ease-in-out',
                    isSignUp ? 'translate-x-0' : '-translate-x-1/4 opacity-0'
                )}>
                    <h1 className="text-3xl font-bold font-headline">¡Bienvenido de vuelta!</h1>
                    <p className="mt-4 text-sm">Para mantenerte conectado con nosotros, por favor inicia sesión con tu información personal</p>
                    <Button variant="outline" onClick={() => setIsSignUp(false)} className="mt-4 rounded-full border-white bg-transparent px-10 py-2 font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white">
                        Iniciar Sesión
                    </Button>
                </div>
                 {/* Overlay Right */}
                <div className={cn(
                    'absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-700 ease-in-out',
                    isSignUp ? 'translate-x-1/4 opacity-0' : 'translate-x-0'
                )}>
                    <h1 className="text-3xl font-bold font-headline">¡Hola, Vendedor!</h1>
                    <p className="mt-4 text-sm">Ingresa tus datos y comienza a vender en minutos</p>
                    <Button variant="outline" onClick={() => setIsSignUp(true)} className="mt-4 rounded-full border-white bg-transparent px-10 py-2 font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white">
                        Regístrate
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

    