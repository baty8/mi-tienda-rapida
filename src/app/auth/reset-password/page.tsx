
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionReady(true);
      }
      if(event === "SIGNED_IN") {
        router.push('/products');
      }
    });

    // Handle initial state in case the event is missed
    const checkInitialState = async () => {
        const {data} = await supabase.auth.getSession();
        if(data.session?.user.aud === 'authenticated') {
             // This can happen if the user is already in the recovery flow when landing
             setIsSessionReady(true);
        }
    }
    checkInitialState();


    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '¡Éxito!', description: 'Tu contraseña ha sido actualizada. Inicia sesión con tu nueva contraseña.' });
      router.push('/');
    }
  };
  
  const renderContent = () => {
      if (!isSessionReady) {
          return (
              <>
                  <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <KeyRound className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                           Esperando...
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Si llegaste aquí desde un enlace de tu correo, tu formulario aparecerá en breve.
                        </CardDescription>
                  </CardHeader>
                   <CardContent>
                      <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                        <Link href="/">
                          Volver al Inicio
                        </Link>
                      </Button>
                    </CardContent>
              </>
          );
      }

      return (
        <>
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <KeyRound className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Restablecer Contraseña
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Introduce tu nueva contraseña a continuación.
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
                    <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600">
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
