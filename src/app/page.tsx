
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabase } from '@/lib/supabase/client';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.902,36.036,44,30.425,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const MiTiendaRapidaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
);

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const supabase = getSupabase();
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session) {
            router.push('/products');
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [router]);

  const handleAuthAction = async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      toast.error('Error', { description: 'No se pudo inicializar Supabase.' });
      setLoading(false);
      return;
    }

    let error;
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        }
      });
      error = signUpError;
       if (!error) {
        toast.info('Verifica tu correo', { description: 'Te hemos enviado un enlace para verificar tu correo electrónico.' });
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    }

    if (error) {
      toast.error('Error', { description: error.message });
    }
    setLoading(false);
  };
  
  const handleOAuthSignIn = async (provider: 'google') => {
    const supabase = getSupabase();
    if (!supabase) {
      toast.error('Error', { description: 'No se pudo inicializar Supabase.' });
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleForgotPassword = async () => {
     if (!forgotPasswordEmail) {
      toast.error('Error', { description: 'Por favor, ingresa tu correo electrónico.' });
      return;
    }
    const supabase = getSupabase();
     if (!supabase) {
      toast.error('Error', { description: 'No se pudo inicializar Supabase.' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast.error('Error', { description: error.message });
    } else {
      toast.info('Revisa tu correo', { description: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.' });
    }
  }


  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 font-body">
      {/* Vista de Escritorio */}
      <div className="hidden w-full max-w-4xl grid-cols-2 overflow-hidden rounded-2xl bg-white text-black shadow-2xl md:grid">
        <div className="flex flex-col justify-center p-12">
          <h1 className="mb-4 font-headline text-3xl font-bold text-gray-800">
            {isSignUp ? 'Crea tu Cuenta' : 'Iniciar Sesión'}
          </h1>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50"
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50"
            />
            <Button
              onClick={handleAuthAction}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </div>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">O</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('google')}
          >
            <GoogleIcon className="mr-2" />
            Continuar con Google
          </Button>
          <p className="mt-6 text-center text-sm">
            {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-semibold text-blue-600 hover:underline"
            >
              {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
            </button>
          </p>
            {!isSignUp && (
              <div className="text-center mt-4">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-sm text-gray-500 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña. Revisa tu carpeta de spam si no lo ves.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="forgot-password-email">Correo Electrónico</Label>
                        <Input
                          id="forgot-password-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={forgotPasswordEmail}
                          onChange={e => setForgotPasswordEmail(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForgotPassword}>Enviar Enlace</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            )}
        </div>
        <div className="flex flex-col items-center justify-center bg-blue-600 p-12 text-white">
          <MiTiendaRapidaLogo className="h-20 w-20" />
          <h2 className="mt-4 text-center font-headline text-3xl font-bold">
            Bienvenido a Mi Tienda Rapida
          </h2>
          <p className="mt-2 text-center text-blue-200">
            La forma más sencilla de gestionar tus productos y ventas.
          </p>
        </div>
      </div>
      {/* Vista Móvil */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-black shadow-2xl md:hidden">
        <div className="text-center">
            <MiTiendaRapidaLogo className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                {isSignUp ? 'Crea tu Cuenta' : 'Bienvenido a Mi Tienda Rapida'}
            </h1>
        </div>
        <div className="mt-8 space-y-4">
            <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50"
            />
            <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50"
            />
            <Button
            onClick={handleAuthAction}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
        </div>
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">O</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn('google')}
        >
            <GoogleIcon className="mr-2" />
            Continuar con Google
        </Button>
        <p className="mt-6 text-center text-sm">
            {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 font-semibold text-blue-600 hover:underline"
            >
            {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
            </button>
        </p>
         {!isSignUp && (
              <div className="text-center mt-4">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-sm text-gray-500 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="forgot-password-email-mobile">Correo Electrónico</Label>
                        <Input
                           id="forgot-password-email-mobile"
                          type="email"
                          placeholder="tu@email.com"
                          value={forgotPasswordEmail}
                          onChange={e => setForgotPasswordEmail(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForgotPassword}>Enviar Enlace</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            )}
      </div>
    </div>
  );
};

export default AuthPage;
