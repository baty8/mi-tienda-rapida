
'use client';
import { useEffect } from 'react';
import {
  User,
  Clock,
  MessageCircle,
  BadgeCheck,
  Phone,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

const daysOfWeek = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export default function ProfilePage() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            }
        };
        checkSession();
    }, [router]);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h2 className="text-2xl font-bold font-headline md:hidden">
            Perfil y Contacto
          </h2>
          <div className="flex items-center gap-4">
            {/* Potentially add actions here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold font-headline">
                Perfil y Contacto
              </h2>
              <p className="text-muted-foreground">
                Gestiona tu disponibilidad e información de contacto.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
             <Card className="xl:col-span-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Información Personal</CardTitle>
                  </div>
                  <CardDescription>
                    Actualiza tus datos personales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input id="first-name" defaultValue="Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Apellido</Label>
                    <Input id="last-name" defaultValue="" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="admin@ventarapida.com"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                    <Button>Guardar Cambios</Button>
                </CardFooter>
              </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle>Disponibilidad</CardTitle>
                </div>
                <CardDescription>
                  Establece tu horario de trabajo y zona horaria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                   <Select>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Selecciona una zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmt-3">
                          (GMT-3) Buenos Aires, Georgetown
                        </SelectItem>
                        <SelectItem value="gmt-4">
                          (GMT-4) Hora del Atlántico (Canadá), Caracas
                        </SelectItem>
                        <SelectItem value="gmt-5">
                          (GMT-5) Hora del Este (EE.UU. y Canadá), Bogotá, Lima
                        </SelectItem>
                        <SelectItem value="gmt-6">
                          (GMT-6) Hora Central (EE.UU. y Canadá), Ciudad de México
                        </SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <Separator />
                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Switch id={`switch-${day.toLowerCase()}`} defaultChecked={day !== 'Sábado' && day !== 'Domingo'} />
                        <Label
                          htmlFor={`switch-${day.toLowerCase()}`}
                          className="text-base font-medium"
                        >
                          {day}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="09:00">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>-</span>
                        <Select defaultValue="17:00">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="17:00">05:00 PM</SelectItem>
                            <SelectItem value="18:00">06:00 PM</SelectItem>
                            <SelectItem value="19:00">07:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar Cambios</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-500 rounded-md">
                      <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle>Integración con WhatsApp</CardTitle>
                </div>
                <CardDescription>
                  Conecta tu cuenta de WhatsApp Business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <div>
                          <p className="font-semibold">Estado</p>
                          <p className="text-sm text-destructive">No Conectado</p>
                      </div>
                      <Button>Conectar</Button>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <CardTitle>Verificación de Contacto</CardTitle>
                </div>
                <CardDescription>
                  Verifica tu número de teléfono por SMS para recibir alertas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button className="w-full">Enviar Código de Verificación</Button>
                  <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <Input
                    id="code"
                    placeholder="Ingresa el código de 6 dígitos"
                  />
                </div>
              </CardContent>
              <CardFooter>
                  <Button variant="outline" className="w-full">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Verificar Código
                  </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
