
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
    {met ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
    {text}
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Password validation state
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  const isLongEnough = password.length >= 8;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setErrorMessage("No se pudo inicializar la conexión.");
      setStatus('error');
      return;
    }

    // This listener is the key. It waits for Supabase to confirm the recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus('ready');
      } else if (session === null) {
        // If the session becomes null after a bit, it likely means the token was invalid or expired.
        // This is a fallback.
        setErrorMessage("Enlace inválido o expirado. Por favor, solicita uno nuevo desde la página de inicio.");
        setStatus('error');
      }
    });

    // Set a timeout to handle cases where the recovery token is invalid or missing
    // and the onAuthStateChange event doesn't fire as expected.
    const timer = setTimeout(() => {
        if (status === 'loading') {
            setErrorMessage("El enlace puede ser inválido o ha expirado. Por favor, solicita uno nuevo.");
            setStatus('error');
        }
    }, 7000); // 7 seconds timeout, giving Supabase ample time

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [status]); // Re-run if status changes, though it shouldn't be necessary.

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Error', { description: 'Las contraseñas no coinciden.' });
      return;
    }
    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Contraseña débil', { description: 'Por favor, cumple con todos los requisitos de seguridad para la contraseña.'});
      return;
    }

    setLoading(true);
    const supabase = getSupabase();
     if (!supabase) {
      toast.error('Error', { description: 'No se pudo inicializar Supabase.' });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error('Error al actualizar', { description: error.message });
    } else {
      toast.success('¡Contraseña actualizada!', { description: 'Tu contraseña ha sido cambiada. Por favor, inicia sesión.' });
      await supabase.auth.signOut(); // Force sign out to require new login
      router.push('/');
    }
  };
  
  const renderContent = () => {
      if (status === 'error') {
          return (
              <>
                 <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <KeyRound className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                       Enlace Inválido o Expirado
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {errorMessage}
                    </CardDescription>
                  </CardHeader>
                   <CardContent>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link href="/">
                          Volver al Inicio
                        </Link>
                      </Button>
                    </CardContent>
              </>
          )
      }
      
      if (status === 'loading') {
          return (
              <div>
                  <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <KeyRound className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                           Verificando Enlace...
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                           Estamos validando tu solicitud. Por favor, espera.
                        </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </CardContent>
              </div>
          );
      }

      return (
        <>
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <KeyRound className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Establecer Nueva Contraseña
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Crea una nueva contraseña para tu cuenta. Esto funciona tanto para restablecer una contraseña olvidada como para crear una por primera vez.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-50"
                    />
                    <Input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-gray-50"
                    />

                    <div className="space-y-2 text-left p-4 bg-muted rounded-lg">
                      <PasswordRequirement met={isLongEnough} text="Al menos 8 caracteres" />
                      <PasswordRequirement met={hasUpperCase} text="Una letra mayúscula" />
                      <PasswordRequirement met={hasLowerCase} text="Una letra minúscula" />
                      <PasswordRequirement met={hasNumber} text="Un número" />
                      <PasswordRequirement met={hasSpecialChar} text="Un carácter especial (!@#...)" />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </Button>
                </form>
            </CardContent>
        </>
      )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <Card className="w-full max-w-md text-center shadow-lg">
        {renderContent()}
      </Card>
    </div>
  );
}
