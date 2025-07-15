
'use client';
import { useEffect, useState, useCallback } from 'react';
import { User, Save, UploadCloud, Palette } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { ThemeToggle } from '@/components/theme-toggle';
import { VendorLayout } from '@/components/vendor-layout';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

type Profile = {
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
  store_template_id: string | null;
};

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Profile>({ name: '', phone: '', avatar_url: '', email: '', store_template_id: 'modern' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
            router.push('/login');
            return;
        }
        
        const user = session.user;
        setUserId(user.id);
        setProfile(prev => ({ ...prev, email: user.email || '' }));

        let { data, error } = await supabase
            .from('profiles')
            .select('name, phone, avatar_url, store_template_id')
            .eq('id', user.id)
            .single();
        
        if (error && error.code === 'PGRST116') {
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ id: user.id, email: user.email, name: 'Vendedor', role: 'vendedor', store_template_id: 'modern' });
            
            if (insertError) {
                toast({ variant: 'destructive', title: 'Error Crítico', description: 'No se pudo crear tu perfil. Contacta a soporte.'});
                setLoading(false);
                return;
            }
            // Refetch after creation
            const { data: refetchedData } = await supabase.from('profiles').select('name, phone, avatar_url, store_template_id').eq('id', user.id).single();
            data = refetchedData;
            toast({ title: '¡Perfil Creado!', description: 'Hemos creado tu perfil. ¡Ya puedes editarlo!' });
        } else if (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el perfil.'});
        }
        
        if (data) {
            setProfile(prev => ({ ...prev, name: data.name, phone: data.phone, avatar_url: data.avatar_url, store_template_id: data.store_template_id || 'modern' }));
            if (data.avatar_url) {
                setAvatarPreview(data.avatar_url);
            }
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSave = async () => {
      if (!userId) return;
      setSaving(true);
      
      let newAvatarUrl = profile.avatar_url;

      if (avatarFile) {
          const fileName = `${userId}/avatar-${Date.now()}`;
          const { error: uploadError } = await supabase.storage
              .from('product_images')
              .upload(fileName, avatarFile, { upsert: true });

          if (uploadError) {
              toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
              setSaving(false);
              return;
          }

          const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(fileName);
          newAvatarUrl = publicUrl;
      }

      const { error } = await supabase
          .from('profiles')
          .update({ 
              name: profile.name, 
              phone: profile.phone,
              avatar_url: newAvatarUrl,
              store_template_id: profile.store_template_id,
          })
          .eq('id', userId);

      if (error) {
          toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
      } else {
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
          setProfile(prev => ({...prev, avatar_url: newAvatarUrl}));
          
          setTimeout(() => {
            window.location.reload();
          }, 1000); 
      }
      setSaving(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

  return (
    <VendorLayout>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-2xl font-bold font-headline md:hidden">
          Perfil y Contacto
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold font-headline">
              Perfil y Contacto
            </h2>
            <p className="text-muted-foreground">
              Gestiona tu información pública y el estilo de tu tienda.
            </p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl mx-auto">
           <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Información Pública del Vendedor</CardTitle>
                </div>
                <CardDescription>
                  Esta información será visible para tus clientes en tu tienda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="space-y-2">
                        <Label>Foto de Perfil / Logo</Label>
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview || undefined} alt="Avatar"/>
                            <AvatarFallback><User className="h-10 w-10 text-muted-foreground"/></AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted relative">
                           {avatarPreview ? (
                                <Image src={avatarPreview} alt="Vista previa" fill sizes="96px" style={{objectFit: 'contain', padding: '0.5rem'}} className="rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-center text-muted-foreground">Haz clic para cambiar</p>
                                </div>
                            )}
                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Tienda / Vendedor</Label>
                  <Input id="name" placeholder="Ej: Tienda de Ana" value={profile.name || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de WhatsApp (con código de país)</Label>
                  <Input id="phone" type="tel" placeholder="Ej: 5491122334455" value={profile.phone || ''} onChange={handleInputChange}/>
                   <p className="text-xs text-muted-foreground">
                    Este número se usará para que los clientes te contacten.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico (no se puede cambiar)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <CardTitle>Estilo de la Tienda</CardTitle>
                </div>
                 <CardDescription>
                  Elige la paleta de colores para tu tienda pública.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <Label htmlFor="store-template">Plantilla de Estilo</Label>
                    <Select
                        value={profile.store_template_id || 'modern'}
                        onValueChange={(templateId) => setProfile({ ...profile, store_template_id: templateId })}
                    >
                        <SelectTrigger id="store-template">
                            <SelectValue placeholder="Elige un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="modern">Moderno (Azul)</SelectItem>
                            <SelectItem value="elegant">Elegante (Gris)</SelectItem>
                            <SelectItem value="sunset">Ocaso Tropical (Naranja)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </CardContent>
            </Card>

            <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving || loading}>
                      <Save className="mr-2 h-4 w-4"/>
                      {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                  </Button>
            </CardFooter>
        </div>
      </main>
    </VendorLayout>
  );
}
