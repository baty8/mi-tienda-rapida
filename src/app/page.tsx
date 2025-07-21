
'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
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
import { Loader2, ShoppingBag, AlertTriangle } from 'lucide-react';
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
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.386,35.637,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);


export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsSupabaseConfigured(false);
      return;
    }
    
    setIsSupabaseConfigured(true);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/products');
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/products');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) return; 
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Error al iniciar sesión', description: error.message });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
      return;
    }
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) return; 
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error al registrarse', description: error.message });
    } else {
      toast({ title: '¡Registro exitoso!', description: 'Por favor, revisa tu correo electrónico para verificar tu cuenta.' });
      setIsLoginView(true); 
    }
    setLoading(false);
  };

  const handleOAuthLogin = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo iniciar sesión con Google: ${error.message}`});
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
     if (!isSupabaseConfigured) return;
     setLoading(true);
     const supabase = getSupabase();
     if (!supabase) return;
     const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
       redirectTo: `${window.location.origin}/auth/reset-password`,
     });
     setLoading(false);
     setForgotDialogOpen(false);
     if (error) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
     } else {
       toast({ title: 'Correo enviado', description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.' });
     }
  };
  
   const NotConfiguredWarning = () => (
      <div className="space-y-4 text-center p-4 border border-yellow-400 bg-yellow-50 rounded-lg">
          <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500" />
          <h3 className="font-bold text-yellow-800">Configuración Requerida</h3>
          <p className="text-sm text-yellow-700">
              La conexión con la base de datos no está configurada. Por favor, añade las variables de entorno 
              <code className="bg-yellow-200 p-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y 
              <code className="bg-yellow-200 p-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 
              a tu archivo <code className="bg-yellow-200 p-1 rounded">.env</code> para continuar.
          </p>
      </div>
  );

  const DesktopWelcomePanel = () => (
      <div className="hidden md:flex flex-col items-center justify-center p-12 text-center text-white bg-gradient-to-br from-blue-500 to-cyan-400 h-full">
            <h2 className="mb-4 text-4xl font-bold font-headline">¡Bienvenido a Tu Tienda Rápida!</h2>
            <p className="mb-8 max-w-sm">
                Administra tu tienda online creando catálogos y administrando tus productos de manera sencilla.
            </p>
            <Button variant="outline" onClick={() => setIsLoginView(!isLoginView)} className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 h-11 px-8 rounded-full">
                {isLoginView ? 'REGÍSTRATE GRATIS' : 'INICIAR SESIÓN'}
            </Button>
      </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 font-body light md:bg-white">
      <div className="w-full max-w-4xl bg-white text-black shadow-2xl md:grid md:grid-cols-2 md:rounded-2xl md:overflow-hidden">
        
        <div className="flex flex-col justify-center p-6 sm:p-12 w-full h-full bg-white">
            <div className="md:hidden text-center mb-8">
                 <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full">
                    <ShoppingBag className="h-8 w-8 text-white"/>
                 </div>
                 <h1 className="mt-4 text-3xl font-bold font-headline text-gray-800">
                    VentaRapida
                 </h1>
                 <p className="text-muted-foreground">
                    {isLoginView ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
                 </p>
            </div>
            
            <h1 className="hidden md:block my-6 text-3xl font-bold font-headline text-gray-800 text-left">
                {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
          
           {!isSupabaseConfigured ? <NotConfiguredWarning /> : (
            <>
              <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
                {!isLoginView && (
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {!isLoginView && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                )}

                {isLoginView && (
                  <div className="text-right">
                    <AlertDialog open={isForgotDialogOpen} onOpenChange={setForgotDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <button type="button" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</button>
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
                          <Input id="forgot-email" type="email" placeholder="tu@email.com" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleForgotPassword}>Enviar Enlace</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg text-base">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoginView ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                </Button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-xs text-gray-500">O</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <Button variant="outline" onClick={handleOAuthLogin} disabled={loading} className="w-full h-11 rounded-lg border-gray-300">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><GoogleIcon className="mr-2" /> Continuar con Google</>}
              </Button>
            </>
          )}


           <div className="mt-6 text-center text-sm md:hidden">
              <button onClick={() => setIsLoginView(!isLoginView)} className="text-blue-600 hover:underline">
                  {isLoginView ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
              </button>
           </div>
        </div>

        <DesktopWelcomePanel />
      </div>
    </main>
  );
}
