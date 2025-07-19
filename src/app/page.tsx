
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/utils';
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    // eslint-disable-next-line
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.826,44,30.338,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);


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
    
    router.push('/products');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
          data: {
              name: signupName || 'Vendedor'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setLoading(false);
    if (error) {
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
  };
  
  const handleOAuthLogin = async (provider: 'google') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Omitting redirectTo to let Supabase use the default Site URL from the dashboard.
        // This is the most reliable method.
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
          redirectTo: `${window.location.origin}/auth/reset-password`
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
      <div className="w-full max-w-4xl rounded-2xl bg-white text-black shadow-2xl grid md:grid-cols-2 overflow-hidden min-h-[600px]">

        {/* Form Panel */}
        <div className="flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full">
            {isSignUp ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Crear Cuenta</h1>
                  <form onSubmit={handleSignUp} className="w-full space-y-4">
                      <Input type="text" placeholder="Nombre" value={signupName} onChange={e => setSignupName(e.target.value)} required className="bg-gray-50 border-gray-300 placeholder:text-gray-500" autoComplete="name"/>
                      <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="bg-gray-50 border-gray-300 placeholder:text-gray-500" autoComplete="email"/>
                      <Input type="password" placeholder="Contraseña" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="bg-gray-50 border-gray-300 placeholder:text-gray-500" autoComplete="new-password"/>
                      <Button type="submit" disabled={loading} className="w-full rounded-full px-12 py-2 font-bold uppercase tracking-wider bg-blue-500 hover:bg-blue-600 text-white">
                        {loading ? 'Creando...' : 'Registrarse'}
                      </Button>
                  </form>
                  <div className="relative my-4 w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O continuar con</span>
                    </div>
                  </div>
                   <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={loading} className="w-full border-gray-300 text-gray-700">
                    <GoogleIcon className="mr-2" />
                    Google
                  </Button>
                  <p className="mt-4 text-sm text-gray-600">
                      ¿Ya tienes una cuenta?{' '}
                      <button type="button" onClick={() => setIsSignUp(false)} className="font-semibold text-blue-500 hover:underline">
                          Iniciar Sesión
                      </button>
                  </p>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <h1 className="text-3xl font-bold font-headline text-gray-800">Iniciar Sesión</h1>
                  
                  <form onSubmit={handleLogin} className="w-full space-y-4">
                    <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="bg-gray-50 border-gray-300 placeholder:text-gray-500" autoComplete="email"/>
                    <Input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="bg-gray-50 border-gray-300 placeholder:text-gray-500" autoComplete="current-password"/>
                    
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button type="button" className="text-sm text-gray-500 hover:underline self-start float-left">¿Olvidaste tu contraseña?</button>
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
                    
                    <Button type="submit" disabled={loading} className="w-full rounded-full px-12 py-2 font-bold uppercase tracking-wider bg-blue-500 hover:bg-blue-600 text-white">
                      {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                  
                  <div className="relative my-4 w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O continuar con</span>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={loading} className="w-full border-gray-300 text-gray-700">
                    <GoogleIcon className="mr-2" />
                    Google
                  </Button>
                  
              </div>
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
