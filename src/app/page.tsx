
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: error.message || 'Credenciales inválidas o correo no verificado.',
      });
      setLoading(false);
      return;
    }
    
    // On successful login, redirect to the products page.
    // A full refresh is more robust to ensure the session is picked up.
    router.push('/products');
    router.refresh();
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
      description: 'Revisa tu correo para verificar tu cuenta y luego inicia sesión aquí.',
      duration: 5000,
    });
    setIsSignUp(false); // Switch back to login form
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
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-[600px]">

        {/* Form Panel */}
        <div className="flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full">
            {isSignUp ? (
              <form onSubmit={handleSignUp} className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Crear Cuenta</h1>
                  <Input type="text" placeholder="Nombre" value={signupName} onChange={e => setSignupName(e.target.value)} required className="bg-gray-100 border-none text-gray-900" />
                  <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="email"/>
                  <Input type="password" placeholder="Contraseña" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="new-password"/>
                  <Button type="submit" disabled={loading} className="mt-2 rounded-full bg-blue-500 px-12 py-2 font-bold uppercase tracking-wider text-white hover:bg-blue-600">
                    {loading ? 'Creando...' : 'Registrarse'}
                  </Button>
                  <p className="mt-4 text-sm">
                      ¿Ya tienes una cuenta?{' '}
                      <button type="button" onClick={() => setIsSignUp(false)} className="font-semibold text-blue-500 hover:underline">
                          Iniciar Sesión
                      </button>
                  </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Iniciar Sesión</h1>
                  <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="email"/>
                  <Input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="bg-gray-100 border-none text-gray-900" autoComplete="current-password"/>
                  
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <button type="button" className="text-sm text-gray-500 hover:underline self-start">¿Olvidaste tu contraseña?</button>
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
            )}
          </div>
        </div>

        {/* Overlay Panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-r from-blue-500 to-cyan-400">
            <h1 className="text-3xl font-bold font-headline">¡Bienvenido a Tu Tienda Rápida!</h1>
            <p className="mt-4 text-sm px-4">Administra tu tienda online creando catálogos y administrando tus productos de manera sencilla.</p>
             <Button variant="outline" onClick={() => setIsSignUp(true)} className="mt-4 rounded-full border-white bg-transparent px-10 py-2 font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white">
                Regístrate Gratis
            </Button>
        </div>
      </div>
    </div>
  );
}
