
import type { Profile } from '@/types';
import { createClient } from '@/lib/utils';
import { StorePageComponent } from '@/components/StorePageComponent';

type VendorFullProfile = Profile & {
    store_bg_color?: string;
    store_primary_color?: string;
    store_accent_color?: string;
    store_font_family?: string;
};

async function getVendorProfile(vendorId: string) {
    const supabase = createClient();
    const { data: vendor, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single();

    if (error || !vendor) {
        return { error: 'No se pudo encontrar la tienda de este vendedor.' };
    }

    return { vendor: vendor as VendorFullProfile };
}

// Este componente de servidor AHORA SOLO carga el perfil del vendedor, una operación muy rápida.
export default async function StorePage({ params }: { params: { vendorId: string } }) {
  const { vendorId } = params;
  const { error, vendor } = await getVendorProfile(vendorId);

  // Pasamos el vendorId y el perfil al componente de cliente.
  // El componente de cliente se encargará de cargar los productos.
  return (
    <StorePageComponent 
        error={error} 
        initialVendor={vendor}
        vendorId={vendorId}
    />
  );
}
