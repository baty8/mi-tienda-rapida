
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product, Catalog } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProductContextType {
  products: Product[];
  catalogs: Catalog[];
  activeCatalog: Catalog | null;
  loading: boolean; // Kept for individual actions like add/delete
  fetchProducts: () => Promise<void>; // This can now refetch everything if needed
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image' | 'in_catalog' | 'user_id'>, imageFile: File | null) => Promise<void>;
  updateProduct: (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category' | 'user_id' | 'in_catalog'>>, imageFile?: File | null) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setActiveCatalog: (catalog: Catalog | null) => void;
  saveCatalog: (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean }) => Promise<void>;
  createCatalog: (name: string) => Promise<void>;
  deleteCatalog: (catalogId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
  initialProducts: Product[];
  initialCatalogs: Catalog[];
}

export const ProductProvider = ({ children, initialProducts, initialCatalogs }: ProductProviderProps) => {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [activeCatalog, setActiveCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(false); // No longer for initial load

  useEffect(() => {
    setProducts(initialProducts);
    setCatalogs(initialCatalogs);
    if (initialCatalogs.length > 0) {
        // Preserve active catalog if it still exists, otherwise default to the first
        const currentActive = activeCatalog ? initialCatalogs.find(c => c.id === activeCatalog.id) : undefined;
        setActiveCatalog(currentActive || initialCatalogs[0]);
    } else {
        setActiveCatalog(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts, initialCatalogs]);

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    };

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudieron recargar los productos: ${error.message}` });
      setProducts([]);
    } else {
      const formattedProducts: Product[] = (data || []).map(formatProduct);
      setProducts(formattedProducts);
    }
    setLoading(false);
  }, [supabase]);


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
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para añadir productos.' });
        setLoading(false);
        return;
    }

    let imageUrl = 'https://placehold.co/600x400.png';
    if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, user.id);
        if (uploadedUrl) imageUrl = uploadedUrl;
        else {
            toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la imagen.' });
            setLoading(false);
            return;
        }
    }

    const { data: newProductData, error } = await supabase.from('products').insert({
      ...productData,
      user_id: user.id,
      image_url: imageUrl,
    }).select().single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo añadir el producto: ${error.message}` });
    } else {
      toast({ title: 'Éxito', description: 'Producto añadido correctamente.' });
      setProducts(prev => [formatProduct(newProductData), ...prev]);
    }
    setLoading(false);
  };

  const updateProduct = async (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image' | 'createdAt' | 'tags' | 'category' | 'user_id' | 'in_catalog'>>, imageFile?: File) => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      let updateData: any = { ...updatedFields };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, user.id);
        if (imageUrl) updateData.image_url = imageUrl;
        else {
          toast({ variant: 'destructive', title: 'Error de Carga', description: 'No se pudo subir la nueva imagen.' });
          setLoading(false);
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
      setLoading(false);
  };

  const deleteProduct = async (productId: string) => {
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
       toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar el producto: ${error.message}` });
    } else {
       toast({ title: 'Éxito', description: 'Producto eliminado.' });
       setProducts(prev => prev.filter(p => p.id !== productId));
    }
    setLoading(false);
  };
  
   const fetchAllCatalogs = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: catalogData, error: catalogError } = await supabase
            .from('catalogs')
            .select(`id, name, created_at, is_public, user_id`)
            .eq('user_id', user.id)
            .order('name', { ascending: true });
        
        if (catalogError) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron recargar los catálogos.' });
            return;
        }

        const catalogIds = catalogData.map(c => c.id);
        const { data: catalogProductsData, error: catalogProductsError } = await supabase
            .from('catalog_products')
            .select('catalog_id, product_id')
            .in('catalog_id', catalogIds);
        
        if (catalogProductsError) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo recargar la relación de productos y catálogos.' });
            return;
        }

        const formattedCatalogs = catalogData.map(c => {
            const product_ids = catalogProductsData
                ?.filter(cp => cp.catalog_id === c.id)
                .map(cp => cp.product_id) || [];
            return { ...c, product_ids };
        });

        setCatalogs(formattedCatalogs as Catalog[]);
        return formattedCatalogs;
    }, [supabase]);


  const createCatalog = async (name: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('catalogs').insert({ name, user_id: user.id, is_public: true }).select().single();
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el catálogo.' });
    } else {
        const newCatalog = { ...data, product_ids: [] };
        setCatalogs(prev => [...prev, newCatalog] as Catalog[]);
        setActiveCatalog(newCatalog as Catalog);
        toast({ title: 'Éxito', description: 'Catálogo creado.' });
    }
    setLoading(false);
  };

  const deleteCatalog = async (catalogId: string) => {
      setLoading(true);
      const { error } = await supabase.from('catalogs').delete().eq('id', catalogId);
      if (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el catálogo.' });
      } else {
          toast({ title: 'Éxito', description: 'Catálogo eliminado.' });
          const remainingCatalogs = catalogs.filter(c => c.id !== catalogId);
          setCatalogs(remainingCatalogs);
          setActiveCatalog(remainingCatalogs.length > 0 ? remainingCatalogs[0] : null);
      }
      setLoading(false);
  };

  const saveCatalog = async (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean; }) => {
    setLoading(true);
    const { name, product_ids, is_public } = catalogData;
    const { error: updateError } = await supabase.from('catalogs').update({ name, is_public }).eq('id', catalogId);
    if (updateError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el catálogo.' });
        setLoading(false);
        return;
    }

    await supabase.from('catalog_products').delete().eq('catalog_id', catalogId);
    if (product_ids.length > 0) {
        const { error: insertError } = await supabase.from('catalog_products').insert(
            product_ids.map(pid => ({ catalog_id: catalogId, product_id: pid }))
        );
        if (insertError) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los productos del catálogo.' });
            setLoading(false);
            return;
        }
    }
    
    const updatedCatalogs = await fetchAllCatalogs();
    if (updatedCatalogs) {
      const updatedCurrentCatalog = updatedCatalogs.find(c => c.id === catalogId);
      if(updatedCurrentCatalog) setActiveCatalog(updatedCurrentCatalog as Catalog);
    }
    toast({ title: 'Éxito', description: 'Catálogo guardado.' });
    setLoading(false);
  };

  return (
    <ProductContext.Provider value={{ products, loading, catalogs, activeCatalog, setActiveCatalog, saveCatalog, createCatalog, addProduct, updateProduct, deleteProduct, fetchProducts, deleteCatalog }}>
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
