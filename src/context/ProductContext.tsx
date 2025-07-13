
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product } from '@/types';
import supabase from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image' | 'in_catalog'>, imageFile: File | null) => Promise<void>;
  updateProduct: (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category'>>, imageFile?: File | null) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const formatProduct = (p: any): Product => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description || '',
      price: p.price,
      cost: p.cost || 0,
      stock: p.stock || 0,
      visible: p.visible,
      image: p.image_url || 'https://placehold.co/300x200.png',
      createdAt: format(new Date(p.created_at), 'yyyy-MM-dd'),
      tags: p.stock > 0 ? [] : ['Out of Stock'],
      category: 'General',
      in_catalog: p.in_catalog || false
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setProducts([]);
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudieron cargar los productos: ${error.message}` });
      setProducts([]);
    } else {
      const formattedProducts: Product[] = (data || []).map(formatProduct);
      setProducts(formattedProducts);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image' | 'in_catalog'>, imageFile: File | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para añadir productos.' });
        return;
    }

    let imageUrl = 'https://placehold.co/600x400.png';
    if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, user.id);
        if (uploadedUrl) {
            imageUrl = uploadedUrl;
        } else {
            toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la imagen.' });
            return;
        }
    }

    const { error } = await supabase.from('products').insert({
      ...productData,
      user_id: user.id,
      image_url: imageUrl,
      in_catalog: false, 
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo añadir el producto: ${error.message}` });
    } else {
      toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
      await fetchProducts();
    }
  };

  const updateProduct = async (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category'>>, imageFile?: File | null) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let updateData: any = { ...updatedFields };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, user.id);
        if (imageUrl) {
          updateData.image_url = imageUrl;
        } else {
          toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la nueva imagen.' });
          return;
        }
      }
      
      const { data, error } = await supabase.from('products').update(updateData).eq('id', productId).select().single();

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo actualizar el producto: ${error.message}` });
      } else {
        if (Object.keys(updatedFields).length > 1 || !('in_catalog' in updatedFields)) {
          toast({ title: 'Éxito', description: 'Producto actualizado.' });
        }
        setProducts(prevProducts => prevProducts.map(p => p.id === productId ? formatProduct(data) : p));
      }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar el producto: ${error.message}` });
    } else {
       toast({ title: 'Éxito', description: 'Producto eliminado.' });
       await fetchProducts();
    }
  };


  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
