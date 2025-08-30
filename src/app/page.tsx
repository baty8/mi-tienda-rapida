
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
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
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
}

function EyMiTiendaWebLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
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
            <line x1="3" x2="21" y1="6" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    );
}

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
    if (!supabase) return;

    // This listener handles redirection AFTER a successful login or OAuth.
    // It will NOT handle password recovery, as that flow is now separate.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session && session.user.recovery_sent_at === undefined) {
            router.push('/products');
        }
    });

    // On initial load, check if there's already a valid, non-recovery session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.recovery_sent_at === undefined) {
        router.push('/products');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleAuthAction = async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      toast.error('Error', { description: 'No se pudo inicializar Supabase.' });
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) {
        toast.error('Error de Registro', { description: error.message });
      } else {
        toast.info('Verifica tu correo', { description: 'Te hemos enviado un enlace para verificar tu correo electrónico.' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error('Error de Inicio de Sesión', { description: error.message });
      } else {
         router.push('/products');
      }
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
        <div className="flex flex-col items-center gap-4">
          <EyMiTiendaWebLogo className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando tu tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <div className="grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl bg-white text-black shadow-2xl">
        {/* Columna del Formulario */}
        <div className="p-8 sm:p-12">
            <div className="md:hidden flex flex-col items-center text-center mb-6">
                 <EyMiTiendaWebLogo className="h-10 w-10 mb-2 text-primary" />
                 <h1 className="font-headline text-2xl font-bold text-gray-800">ey mi tienda web!</h1>
            </div>
          <h2 className="font-headline text-3xl font-bold text-gray-800">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp ? 'Rellena los campos para empezar.' : 'Bienvenido/a de nuevo.'}
          </p>

          <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-gray-50"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-gray-50"
                required
              />
            </div>

            {!isSignUp && (
              <div className="text-right text-sm">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button type="button" className="font-semibold text-primary hover:underline">
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
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-3 text-base font-semibold text-white hover:bg-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </form>

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

          <div className="md:hidden text-center mt-6">
              <p className="text-sm">
                  {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline ml-1">
                      {isSignUp ? 'Inicia Sesión' : 'Regístrate Gratis'}
                  </button>
              </p>
          </div>

        </div>

        {/* Columna de Bienvenida */}
        <div className="hidden md:flex flex-col items-center justify-center bg-primary p-12 text-white text-center">
            <EyMiTiendaWebLogo className="h-16 w-16 mb-4" />
           <h2 className="font-headline text-4xl font-bold">
            {isSignUp ? '¡Hola!' : 'Bienvenido a ey mi tienda web!'}
          </h2>
          <p className="mt-4 max-w-sm">
             {isSignUp
              ? 'Únete a nosotros y empieza a vender tus productos en minutos.'
              : 'Administra tu tienda online creando catálogos y administrando tus productos de manera sencilla.'
            }
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-8 bg-transparent border-2 border-white text-white shadow-md hover:bg-white hover:text-primary hover:scale-105 hover:shadow-lg transform transition-all duration-300"
          >
            {isSignUp ? 'Ya tengo una cuenta' : 'Regístrate Gratis'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
