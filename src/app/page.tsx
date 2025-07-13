
'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Assuming you have a Product type defined elsewhere
interface Product { 
  id: number; // Based on your table schema
  name: string;
  descripción: string; // Column name from your schema
  price: number;
  'URL de foto': string; // Column name from your schema - use quotes for names with spaces
  visible: boolean;
  tenant_id: number; // Based on your table schema
} 

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      // TODO: This tenant_id should be dynamic, based on which vendor's products we want to show.
      const placeholderTenantId = 1; // Replace with actual logic to get the tenant_id
      console.log("Fetching products for tenant:", placeholderTenantId); // Add log
      const { data, error } = await supabase
        .from('products') // Table name is correct
        .select('id, name, descripción, precio, "URL de foto", visible, tenant_id') // Select columns matching your schema
        .eq('visible', true); // Only fetch visible products

      if (error) {
        console.error('Error fetching products:', error);
        console.error('Error details:', error.message); // Log error message
        setError('Error loading products.');
      } else {
        setProducts(data || []);
        console.log("Products fetched:", data); // Log fetched data
      }
      setLoading(false);
    }

    fetchProducts();
  }, [supabase]); // Refetch products if supabase client changes (unlikely but good practice)

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // TODO: Implement WhatsApp link generation (requires seller's WhatsApp number)
  const getWhatsAppLink = (product: Product) => {
    // Placeholder - replace with actual logic to get seller's number and message
    const sellerPhoneNumber = 'REPLACE_WITH_SELLERS_WHATSAPP_NUMBER_FOR_THIS_TENANT'; // e.g., '+1234567890' - This should also be dynamic based on tenant
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center"> {/* Simplified layout for buyer view */}
      <div className="flex flex-col flex-1 items-center justify-center p-4 w-full"> {/* Centering content for buyer view */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
           <div className="flex w-full items-center justify-between">
             <h1 className="text-xl font-semibold">Tu Tienda Online</h1>
             <Link href="/login">
                <Button>Iniciar Sesión</Button>
             </Link>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h2 className="text-3xl font-bold font-headline mb-6 text-center">Catálogo de Productos</h2>

          {loading && <p className="text-center">Cargando productos...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && products.length === 0 && (
            <p className="text-center text-muted-foreground">No hay productos visibles en este momento.</p>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => openModal(product)} // Open modal on click
              >
                <img
                  src={product['URL de foto'] || 'https://placehold.co/300x200'} // Use column name from your schema
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</h3> {/* Add overflow handling */}
                  <p className="text-primary font-bold">${product.price.toFixed(2)}</p> {/* Use correct column name */}
                </div>
              </div>
            ))}
          </div>

          {/* Product Detail Modal (Placeholder) */}
          {isModalOpen && selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-auto relative">
                <button
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
                  onClick={closeModal}
                >
                  &times;
                </button>
                <h3 className="text-2xl font-bold mb-4">{selectedProduct.name}</h3>
                <img src={selectedProduct['URL de foto'] || 'https://placehold.co/300x200'} alt={selectedProduct.name} className="w-full h-48 object-cover mb-4" /> {/* Use column name */}
                <p className="text-gray-700 mb-4">{selectedProduct.descripción}</p> {/* Use correct column name */}
                <p className="text-primary font-bold text-xl mb-4">${selectedProduct.price.toFixed(2)}</p>
                <a href={getWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer" className="block"> {/* Make link a block for full button width */}
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full">Consultar por WhatsApp</button>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
