
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product, Catalog } from '@/types';
import supabase from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProductContextType {
  products: Product[];
  catalogs: Catalog[];
  activeCatalog: Catalog | null;
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image' | 'in_catalog' | 'user_id'>, imageFile: File | null) => Promise<void>;
  updateProduct: (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category' | 'user_id' | 'in_catalog'>>, imageFile?: File | null) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setActiveCatalog: (catalog: Catalog | null) => void;
  saveCatalog: (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean }) => Promise<void>;
  createCatalog: (name: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [activeCatalog, setActiveCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const formatProduct = (p: any): Product => ({
      id: p.id,
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
      in_catalog: p.in_catalog || false,
      user_id: p.user_id,
  });
  
  const fetchCatalogsAndProducts = useCallback(async (userId: string) => {
    setLoading(true);

    const { data: catalogData, error: catalogError } = await supabase
        .from('catalogs')
        .select(`*, catalog_products(product_id)`)
        .eq('user_id', userId);
    
    if (catalogError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los catálogos.' });
    } else {
        const formattedCatalogs = catalogData.map(c => ({
            ...c,
            product_ids: c.catalog_products.map((cp: any) => cp.product_id),
        }));
        setCatalogs(formattedCatalogs);

        if (formattedCatalogs.length > 0) {
            const currentActive = activeCatalog ? formattedCatalogs.find(c => c.id === activeCatalog.id) : undefined;
            if(currentActive){
              setActiveCatalog(currentActive);
            } else {
              setActiveCatalog(formattedCatalogs[0]);
            }
        } else {
            setActiveCatalog(null);
        }
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId) 
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudieron cargar los productos: ${error.message}` });
      setProducts([]);
    } else {
      const formattedProducts: Product[] = (data || []).map(formatProduct);
      setProducts(formattedProducts);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if(user.id !== currentUserId){
            setCurrentUserId(user.id);
            await fetchCatalogsAndProducts(user.id);
        }
      } else {
        setLoading(false);
      }
    };
    checkUserAndFetch();
  }, [currentUserId, fetchCatalogsAndProducts]);
  
  const fetchProducts = useCallback(async () => {
      if (currentUserId) {
          await fetchCatalogsAndProducts(currentUserId);
      }
  }, [currentUserId, fetchCatalogsAndProducts]);

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

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image' | 'in_catalog' | 'user_id'>, imageFile: File | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para añadir productos.' });
        return;
    }

    let imageUrl = 'https://placehold.co/600x400.png';
    if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, user.id);
        if (uploadedUrl) imageUrl = uploadedUrl;
        else {
            toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la imagen.' });
            return;
        }
    }

    const { error } = await supabase.from('products').insert({
      ...productData,
      user_id: user.id,
      image_url: imageUrl,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo añadir el producto: ${error.message}` });
    } else {
      toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
      await fetchProducts();
    }
  };

  const updateProduct = async (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category' | 'user_id'>>, imageFile?: File | null) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let updateData: any = { ...updatedFields };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, user.id);
        if (imageUrl) updateData.image_url = imageUrl;
        else {
          toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la nueva imagen.' });
          return;
        }
      }
      
      const { data, error } = await supabase.from('products').update(updateData).eq('id', productId).eq('user_id', user.id).select().single();

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo actualizar el producto: ${error.message}` });
      } else {
        toast({ title: 'Éxito', description: 'Producto actualizado.' });
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

  const createCatalog = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('catalogs').insert({ name, user_id: user.id, is_public: true }).select().single();
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el catálogo.' });
    } else {
        const newCatalog = { ...data, product_ids: [] };
        setCatalogs(prev => [...prev, newCatalog]);
        setActiveCatalog(newCatalog);
        toast({ title: 'Éxito', description: 'Catálogo creado.' });
    }
  };

  const saveCatalog = async (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean; }) => {
    const { name, product_ids, is_public } = catalogData;
    const { error: updateError } = await supabase.from('catalogs').update({ name, is_public }).eq('id', catalogId);
    if (updateError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el catálogo.' });
        return;
    }

    await supabase.from('catalog_products').delete().eq('catalog_id', catalogId);
    if (product_ids.length > 0) {
        const { error: insertError } = await supabase.from('catalog_products').insert(
            product_ids.map(pid => ({ catalog_id: catalogId, product_id: pid }))
        );
        if (insertError) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los productos del catálogo.' });
            return;
        }
    }
    await fetchProducts();
  };

  return (
    <ProductContext.Provider value={{ products, loading, catalogs, activeCatalog, setActiveCatalog, saveCatalog, createCatalog, addProduct, updateProduct, deleteProduct, fetchProducts }}>
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
