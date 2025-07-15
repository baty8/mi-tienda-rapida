
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.aud === 'authenticated') {
        router.replace('/products');
      }
    };
    checkSession();
  }, [router, supabase.auth]);

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
        description: authError?.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      });
      setLoading(false);
      return;
    }

    if (authData.user.aud !== 'authenticated') {
        toast({
            title: 'Confirmación pendiente',
            description: 'Por favor, revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
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
      options: {
          data: {
              name: signupName || 'Vendedor'
          },
          emailRedirectTo: `${window.location.origin}/`
      }
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
    
    toast({
      title: '¡Registro casi completo!',
      description: 'Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
    });
    setIsSignUp(false);
    setLoading(false);
  };
  
  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: error.message,
      });
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
      if (!forgotPasswordEmail) {
          toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce tu correo electrónico.' });
          return;
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
          redirectTo: `${window.location.origin}/`
      });
      setLoading(false);
      if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: 'Correo enviado', description: 'Si existe una cuenta, recibirás un enlace para restablecer tu contraseña.' });
      }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <div className={cn(
        'relative w-full max-w-4xl min-h-[550px] overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-700'
      )}>

        {/* Form Container */}
        <div className={cn(
            'absolute top-0 h-full transition-all duration-700 ease-in-out',
            'left-0 w-1/2 z-20',
            isSignUp && 'translate-x-full'
        )}>
          {/* Sign In Form */}
          <form onSubmit={handleLogin} className={cn(
            'flex h-full flex-col items-center justify-center gap-4 bg-white px-10 text-center transition-opacity duration-300',
            isSignUp && 'opacity-0'
          )}>
            <h1 className="text-3xl font-bold font-headline text-gray-800">Iniciar Sesión</h1>
            <div className="my-2 flex justify-center gap-4">
                <Button variant="outline" size="icon" type="button" onClick={() => handleOAuthLogin('google')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M21.35 11.1H12.18V13.83H18.67C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.36 5.83 12.19 5.83C14.27 5.83 15.94 6.51 17.22 7.73L19.34 5.61C17.22 3.79 14.86 2.86 12.19 2.86C7.03 2.86 3 7.13 3 12.55C3 17.97 7.03 22.24 12.19 22.24C17.65 22.24 21.5 18.22 21.5 12.91C21.5 12.21 21.45 11.65 21.35 11.1Z"></path></svg>
                    <span className="sr-only">Iniciar sesión con Google</span>
                </Button>
                <Button variant="outline" size="icon" type="button" onClick={() => handleOAuthLogin('apple')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M20.94 15.35c-.88 2.48-2.61 4.5-4.95 4.5c-1.3 0-2.2-.6-3.14-.6c-.94 0-1.63.57-2.94.57c-2.43 0-4.51-2.04-5.39-4.55C3.3 14.54 4.04 8.7 6.4 7.23C7.57 6.5 8.95 6.13 10.21 6.13c1.3 0 2.42.4 3.33.4c.91 0 2.22-.5 3.73-.42c.3.01 2.44.38 3.67 2.24c-.03.02-2.14 1.25-2.14 3.52c0 2.72 2.67 3.75 2.81 3.86M15.3 4.31c.6-.74 1.05-1.78 1-2.94c-.75.05-1.78.63-2.42 1.38c-.62.72-1.13 1.79-1.03 2.89c.8.12 1.81-.59 2.45-1.33"></path></svg>
                    <span className="sr-only">Iniciar sesión con Apple</span>
                </Button>
            </div>
            <span className="text-sm text-gray-500">o usa tu cuenta para acceder</span>
            <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="email"/>
            <Input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="current-password"/>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button type="button" className="text-sm text-gray-500 hover:underline">¿Olvidaste tu contraseña?</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="forgot-email">Correo Electrónico</Label>
                      <Input id="forgot-email" type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} placeholder="tu@email.com" />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePasswordReset} disabled={loading}>
                          {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Button type="submit" disabled={loading} className="mt-2 rounded-full bg-blue-500 px-12 py-2 font-bold uppercase tracking-wider text-white hover:bg-blue-600">
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className={cn(
            'flex h-full flex-col items-center justify-center gap-4 bg-white px-10 text-center transition-opacity duration-300',
            !isSignUp && 'opacity-0'
          )}>
            <h1 className="text-3xl font-bold font-headline text-gray-800">Crear Cuenta</h1>
            <div className="my-2 flex justify-center gap-4">
                <Button variant="outline" size="icon" type="button" onClick={() => handleOAuthLogin('google')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M21.35 11.1H12.18V13.83H18.67C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.36 5.83 12.19 5.83C14.27 5.83 15.94 6.51 17.22 7.73L19.34 5.61C17.22 3.79 14.86 2.86 12.19 2.86C7.03 2.86 3 7.13 3 12.55C3 17.97 7.03 22.24 12.19 22.24C17.65 22.24 21.5 18.22 21.5 12.91C21.5 12.21 21.45 11.65 21.35 11.1Z"></path></svg>
                    <span className="sr-only">Registrarse con Google</span>
                </Button>
                <Button variant="outline" size="icon" type="button" onClick={() => handleOAuthLogin('apple')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M20.94 15.35c-.88 2.48-2.61 4.5-4.95 4.5c-1.3 0-2.2-.6-3.14-.6c-.94 0-1.63.57-2.94.57c-2.43 0-4.51-2.04-5.39-4.55C3.3 14.54 4.04 8.7 6.4 7.23C7.57 6.5 8.95 6.13 10.21 6.13c1.3 0 2.42.4 3.33.4c.91 0 2.22-.5 3.73-.42c.3.01 2.44.38 3.67 2.24c-.03.02-2.14 1.25-2.14 3.52c0 2.72 2.67 3.75 2.81 3.86M15.3 4.31c.6-.74 1.05-1.78 1-2.94c-.75.05-1.78.63-2.42 1.38c-.62.72-1.13 1.79-1.03 2.89c.8.12 1.81-.59 2.45-1.33"></path></svg>
                    <span className="sr-only">Registrarse con Apple</span>
                </Button>
            </div>
            <span className="text-sm text-gray-500">o usa tu email para registrarte</span>
            <Input type="text" placeholder="Nombre" value={signupName} onChange={e => setSignupName(e.target.value)} required className="bg-gray-100 border-none text-gray-900" />
            <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="email"/>
            <Input type="password" placeholder="Contraseña" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="new-password"/>
            <Button type="submit" disabled={loading} className="mt-2 rounded-full bg-blue-500 px-12 py-2 font-bold uppercase tracking-wider text-white hover:bg-blue-600">
              {loading ? 'Creando...' : 'Registrarse'}
            </Button>
          </form>
        </div>


        {/* Overlay Container */}
        <div className={cn(
            'absolute top-0 left-1/2 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-40',
             isSignUp ? '-translate-x-full' : 'translate-x-0'
        )}>
            <div className={cn(
                'relative h-full w-[200%] bg-gradient-to-r from-blue-500 to-cyan-400 text-white transition-transform duration-700 ease-in-out',
                 isSignUp ? 'translate-x-1/2' : 'translate-x-0'
            )}>
                {/* Overlay Sign In */}
                <div className={cn(
                    'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-700 ease-in-out',
                    'left-0 transform',
                    isSignUp ? 'translate-x-0' : '-translate-x-[20%] opacity-0'
                )}>
                    <h1 className="text-3xl font-bold font-headline">¡Bienvenido de vuelta!</h1>
                    <p className="mt-4 text-sm">Para mantenerte conectado con nosotros, por favor inicia sesión con tu información personal</p>
                    <Button variant="outline" onClick={() => setIsSignUp(false)} className="mt-4 rounded-full border-white bg-transparent px-10 py-2 font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white">
                        Iniciar Sesión
                    </Button>
                </div>

                {/* Overlay Sign Up */}
                <div className={cn(
                    'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-700 ease-in-out',
                    'right-0 transform',
                     isSignUp ? 'translate-x-[20%] opacity-0' : 'translate-x-0'
                )}>
                    <h1 className="text-3xl font-bold font-headline">¡Hola, Vendedor!</h1>
                    <p className="mt-4 text-sm">Crea tu catálogo, administra tus productos y publícalo en la red para obtener ventas.</p>
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
