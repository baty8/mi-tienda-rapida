
'use client';
import { useEffect, useState, useCallback } from 'react';
import { User, Save, UploadCloud, Palette, Eye, Type, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import type { Profile } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const templates = [
  { id: 'blanco-moderno', name: 'Blanco Moderno', colors: { bg: '#FFFFFF', primary: '#111827', accent: '#F3F4F6' } },
  { id: 'negro-moderno', name: 'Negro Moderno', colors: { bg: '#111827', primary: '#FFFFFF', accent: '#1F2937' } },
  { id: 'gris-sofisticado', name: 'Gris Sofisticado', colors: { bg: '#E5E7EB', primary: '#1F2937', accent: '#D1D5DB' } },
  { id: 'crema-vintage', name: 'Crema Vintage', colors: { bg: '#F5F3EF', primary: '#4A2E2E', accent: '#EAE5E0' } },
];

const fonts = [
    { id: 'PT Sans', name: 'PT Sans (Por defecto)', family: 'PT Sans, sans-serif' },
    { id: 'Roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
    { id: 'Lato', name: 'Lato', family: 'Lato, sans-serif' },
    { id: 'Merriweather', name: 'Merriweather (Serif)', family: 'Merriweather, serif' },
    { id: 'Inconsolata', name: 'Inconsolata (Mono)', family: 'Inconsolata, monospace' },
];


function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Partial<Profile>>({ 
      name: '', 
      phone: '', 
      avatar_url: '', 
      email: '',
      store_bg_color: '#FFFFFF',
      store_primary_color: '#1E40AF',
      store_accent_color: '#F3F4F6',
      store_font_family: 'PT Sans',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPreparingPreview, setIsPreparingPreview] = useState(false);

    const [storeLink, setStoreLink] = useState('');

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/');
            return;
        }
        
        const user = session.user;
        setUserId(user.id);
        
        if (typeof window !== 'undefined') {
            setStoreLink(`${window.location.origin}/store/${user.id}`);
        }

        let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el perfil. Por favor, recarga la página.'});
             setLoading(false);
             return;
        }
        
        if (data) {
            setProfile({ 
                name: data.name, 
                phone: data.phone, 
                avatar_url: data.avatar_url, 
                email: user.email || '',
                store_bg_color: data.store_bg_color || '#FFFFFF',
                store_primary_color: data.store_primary_color || '#1E40AF',
                store_accent_color: data.store_accent_color || '#F3F4F6',
                store_font_family: data.store_font_family || 'PT Sans',
            });
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
              store_bg_color: profile.store_bg_color,
              store_primary_color: profile.store_primary_color,
              store_accent_color: profile.store_accent_color,
              store_font_family: profile.store_font_family,
          })
          .eq('id', userId);

      if (error) {
          toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
      } else {
          toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
          setProfile(prev => ({...prev, avatar_url: newAvatarUrl}));
          // No reload, just state update is enough
      }
      setSaving(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };
    
    const handleColorChange = (colorType: 'store_bg_color' | 'store_primary_color' | 'store_accent_color', value: string) => {
        setProfile(prev => ({ ...prev, [colorType]: value }));
    };

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setProfile(prev => ({
                ...prev,
                store_bg_color: template.colors.bg,
                store_primary_color: template.colors.primary,
                store_accent_color: template.colors.accent,
            }))
        }
    };
    
    const handleFontChange = (fontId: string) => {
        setProfile(prev => ({ ...prev, store_font_family: fontId }));
    };

    const handlePreparePreview = async () => {
      setIsPreparingPreview(true);
      await handleSave(); // Save any pending changes first
      setIsPreviewOpen(true);
      // The preview will now open, and the iframe will load the storeLink
      // The loading of the preview content is handled by the iframe itself.
      setIsPreparingPreview(false);
    }

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <h2 className="text-xl font-bold font-headline">
          Perfil y Tienda
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
           <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" onClick={handlePreparePreview} disabled={isPreparingPreview}>
                        {isPreparingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Eye className="mr-2 h-4 w-4" />}
                        {isPreparingPreview ? 'Cargando...' : 'Visualizar'}
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-[340px] p-0 bg-transparent border-none shadow-none sm:max-w-[370px]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Previsualización Móvil</DialogTitle>
                        <DialogDescription>Previsualización de tu tienda pública en un marco de teléfono.</DialogDescription>
                    </DialogHeader>
                    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl sm:h-[640px] sm:w-[320px]">
                        <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800">
                             {storeLink && isPreviewOpen ? (
                                <iframe
                                    src={storeLink}
                                    className="h-full w-full border-0"
                                    title="Previsualización de la tienda móvil"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-white">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>
                     <DialogClose asChild>
                      <button className="absolute top-0 right-0 mt-[-10px] mr-[-20px] sm:mt-0 sm:mr-0 rounded-full bg-background p-1.5 text-foreground opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 shadow-lg">
                          <X className="h-5 w-5" />
                          <span className="sr-only">Cerrar</span>
                      </button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="mr-2 h-4 w-4"/>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground mb-6">
            Gestiona tu información pública y el estilo de tu tienda.
        </p>

        <div className="grid gap-6 max-w-4xl mx-auto">
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
                        Elige una plantilla o personaliza los colores y la tipografía de tu tienda pública.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="template-select">Elige una plantilla de colores</Label>
                        <Select onValueChange={handleTemplateChange}>
                            <SelectTrigger id="template-select" className="w-full md:w-1/2 mt-2">
                                <SelectValue placeholder="Selecciona una plantilla" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="store_bg_color">Color de Fondo</Label>
                            <Input id="store_bg_color" type="color" value={profile.store_bg_color || '#FFFFFF'} onChange={e => handleColorChange('store_bg_color', e.target.value)} className="h-10 p-1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store_primary_color">Color Primario (Títulos)</Label>
                            <Input id="store_primary_color" type="color" value={profile.store_primary_color || '#111827'} onChange={e => handleColorChange('store_primary_color', e.target.value)} className="h-10 p-1"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="store_accent_color">Color de Acento (Tarjetas)</Label>
                            <Input id="store_accent_color" type="color" value={profile.store_accent_color || '#F3F4F6'} onChange={e => handleColorChange('store_accent_color', e.target.value)} className="h-10 p-1"/>
                        </div>
                    </div>
                    
                    <div className="border-t pt-6">
                         <div className="flex items-center gap-2 mb-2">
                            <Type className="h-5 w-5" />
                            <Label>Tipografía de la Tienda</Label>
                        </div>
                        <Select value={profile.store_font_family || 'PT Sans'} onValueChange={handleFontChange}>
                            <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder="Selecciona una tipografía" />
                            </SelectTrigger>
                            <SelectContent>
                                {fonts.map(font => (
                                    <SelectItem key={font.id} value={font.id}>{font.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <div className='mt-4 p-4 rounded-lg bg-muted' style={{ fontFamily: fonts.find(f => f.id === profile.store_font_family)?.family }}>
                            <h3 className="text-lg font-bold">Así se verá el texto</h3>
                            <p className="text-sm">Esta es una descripción de ejemplo.</p>
                            <p className="font-bold mt-2">$99.99</p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
