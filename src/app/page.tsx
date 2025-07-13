
'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      console.log("Fetching products for public view...");
      const { data, error } = await supabase
        .from('products') 
        .select('*')
        .eq('visible', true); 

      if (error) {
        console.error('Error fetching products:', error);
        setError(`Error al cargar productos: ${error.message}`);
      } else {
        const formattedProducts: Product[] = (data || []).map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          description: p.description || '',
          price: p.price,
          cost: p.cost || 0,
          stock: p.stock || 0,
          visible: p.visible,
          image: p.image_url || 'https://placehold.co/300x200',
          createdAt: p.created_at,
          tags: [], // Tags can be derived or added if needed
          category: 'General' // Category can be added if needed
        }))
        setProducts(formattedProducts);
        console.log("Products fetched:", formattedProducts); 
      }
      setLoading(false);
    }

    fetchProducts();
  }, []); // Only run on mount

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const getWhatsAppLink = (product: Product) => {
    // This needs to be dynamic based on the seller's info, fetched via tenant_id or product_id
    const sellerPhoneNumber = '1234567890'; // Placeholder
    const message = `Hola, estoy interesado en el producto "${product.name}". ¿Está disponible?`;
    return `https://wa.me/${sellerPhoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50"> 
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
           <div className="flex w-full items-center justify-between">
             <h1 className="text-xl font-bold font-headline text-primary">Tu Tienda Online</h1>
             <Link href="/login">
                <Button>Iniciar Sesión</Button>
             </Link>
           </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold font-headline mb-8 text-center text-gray-800">Catálogo de Productos</h2>

        {loading && <p className="text-center text-gray-500">Cargando productos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <h3 className="text-2xl font-semibold">No hay productos disponibles</h3>
            <p className="mt-2">Vuelve a intentarlo más tarde.</p>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group border rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
              onClick={() => openModal(product)} 
            >
              <div className="w-full h-48 overflow-hidden">
                <Image
                  src={product.image || 'https://placehold.co/300x200'}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-gray-800">{product.name}</h3> 
                <p className="text-primary font-bold text-xl">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-in fade-in-0">
            <div className="bg-white rounded-xl p-6 max-w-md w-full relative transform transition-all duration-300 animate-in zoom-in-95">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-2xl"
                onClick={closeModal}
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-4 font-headline">{selectedProduct.name}</h3>
              <div className="w-full h-56 rounded-lg overflow-hidden mb-4">
                 <Image src={selectedProduct.image || 'https://placehold.co/300x200'} alt={selectedProduct.name} width={400} height={224} className="w-full h-full object-cover" />
              </div> 
              <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
              <p className="text-primary font-bold text-2xl mb-6">${selectedProduct.price.toFixed(2)}</p>
              <a href={getWhatsAppLink(selectedProduct)} target="_blank" rel="noopener noreferrer" className="block"> 
                <button className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 w-full font-semibold transition-colors duration-300">Consultar por WhatsApp</button>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
