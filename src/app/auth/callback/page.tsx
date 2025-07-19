
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
            ¡Verificación Completa!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
            <Link href="/">
              Ir a Iniciar Sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
