
'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

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
      fill="#1E88E5"
      d="M44,24c0-0.112-0.014-0.221-0.02-0.33l-0.007-0.126l-0.016-0.124l-0.012-0.091l-0.021-0.134l-0.015-0.08l-0.025-0.132l-0.019-0.08l-0.029-0.125l-0.022-0.07l-0.032-0.117l-0.025-0.062l-0.035-0.106l-0.028-0.052l-0.039-0.095l-0.031-0.043l-0.042-0.082l-0.034-0.034l-0.046-0.071l-0.037-0.025l-0.049-0.059l-0.04-0.016l-0.051-0.045l-0.042-0.007l-0.054-0.031l-0.045,0.007c-0.159-0.054-0.323-0.101-0.492-0.142l-0.045-0.011l-0.058-0.028l-0.048-0.011l-0.061-0.024l-0.05-0.011l-0.063-0.02l-0.052-0.007l-0.066-0.016l-0.055-0.004l-0.068-0.011l-0.057,0.002l-0.069-0.007l-0.059,0.004c-0.211-0.022-0.424-0.036-0.639-0.04l-0.061-0.002l-0.071,0.002c-0.21-0.005-0.421-0.005-0.632-0.005H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,38.937,44,32.2,44,24z"
    />
  </svg>
);


function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
         toast({
          variant: "destructive",
          title: "Email no confirmado",
          description: "Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.",
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de inicio de sesión',
          description: 'El correo electrónico o la contraseña son incorrectos.',
        });
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error de registro',
        description: error.message,
      });
    } else {
      toast({
        title: '¡Revisa tu correo!',
        description: 'Se ha enviado un enlace de verificación a tu correo electrónico para completar el registro.',
      });
    }
  };

  const handleOAuthLogin = async () => {
    // This simple call forces the popup flow, which works best for local dev
    // and is also robust for production.
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce tu correo electrónico.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        toast({ title: '¡Revisa tu correo!', description: 'Se ha enviado un enlace para restablecer tu contraseña.' });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-black shadow-2xl dark:bg-gray-800 dark:text-white">
        <h1 className="text-center text-3xl font-bold font-headline text-gray-800 dark:text-white">
          Bienvenido a VentaRapida
        </h1>
        <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
          Tu sistema de ventas, simple y potente.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-50 dark:bg-gray-700"
          />

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            <Button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              Registrarse
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              O continúa con
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleOAuthLogin}
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          Google
        </Button>
        
        <div className="mt-4 text-center">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                     <button className="text-sm text-blue-500 hover:underline dark:text-blue-400">
                        ¿Olvidaste tu contraseña?
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                           Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="forgot-password-email">Correo Electrónico</Label>
                        <Input id="forgot-password-email" type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} placeholder="tu@email.com" />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForgotPassword} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Enlace
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
