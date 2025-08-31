

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product, Catalog, Profile } from '@/types';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { User } from '@supabase/supabase-js';


interface ProductContextType {
  products: Product[];
  catalogs: Catalog[];
  activeCatalog: Catalog | null;
  profile: Profile | null;
  loading: boolean; // For individual actions like add/delete
  globalLoading: boolean; // For initial data load
  fetchProducts: () => Promise<void>;
  fetchInitialProfile: (user: User) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image_urls' | 'in_catalog' | 'user_id'>, imageFiles: File[]) => Promise<void>;
  updateProduct: (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image_urls' | 'createdAt' | 'tags' | 'category' | 'user_id' | 'in_catalog'>>, imageFiles?: File[], existingImageUrls?: string[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setActiveCatalog: (catalog: Catalog | null) => void;
  saveCatalog: (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean }) => Promise<void>;
  createCatalog: (name: string) => Promise<void>;
  deleteCatalog: (catalogId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const supabase = getSupabase();

  const formatProduct = (p: any): Product => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      cost: p.cost || 0,
      stock: p.stock || 0,
      visible: p.visible,
      image_urls: (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) ? p.image_urls : ['https://placehold.co/600x400.png'],
      createdAt: format(new Date(p.created_at), 'yyyy-MM-dd'),
      tags: p.stock > 0 ? [] : ['Out of Stock'],
      category: 'General',
      in_catalog: p.in_catalog || false,
      user_id: p.user_id,
  });

  const fetchProducts = useCallback(async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error', { description: `No se pudieron recargar los productos: ${error.message}` });
      setProducts([]);
    } else {
      setProducts((data || []).map(formatProduct));
    }
  }, [supabase]);
  
  const fetchAllCatalogs = useCallback(async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: catalogData, error: catalogError } = await supabase
            .from('catalogs')
            .select(`id, name, created_at, is_public, user_id`)
            .eq('user_id', user.id)
            .order('name', { ascending: true });
        
        if (catalogError) {
            toast.error('Error', { description: 'No se pudieron recargar los catálogos.' });
            setCatalogs([]);
            return [];
        }
        if (!catalogData || catalogData.length === 0) {
            setCatalogs([]);
            return [];
        }

        const catalogIds = catalogData.map(c => c.id);
        
        const { data: catalogProductsData, error: catalogProductsError } = await supabase
            .from('catalog_products')
            .select('catalog_id, product_id')
            .in('catalog_id', catalogIds);
        
        if (catalogProductsError) {
            toast.error('Error', { description: 'No se pudo recargar la relación de productos y catálogos.' });
        }

        const formattedCatalogs = catalogData.map(c => {
            const product_ids = (catalogProductsData || [])
                ?.filter(cp => cp.catalog_id === c.id)
                .map(cp => cp.product_id) || [];
            return { ...c, product_ids };
        });

        setCatalogs(formattedCatalogs as Catalog[]);
        setActiveCatalog(prev => {
            const currentActive = prev ? formattedCatalogs.find(c => c.id === prev.id) : undefined;
            return currentActive || formattedCatalogs[0] || null;
        });
        return formattedCatalogs;
    }, [supabase]);

  const fetchInitialProfile = useCallback(async (user: User) => {
    if (!supabase) return;
    setGlobalLoading(true);

    try {
        const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single();
        const productsPromise = fetchProducts();
        const catalogsPromise = fetchAllCatalogs();

        const [{ data: profileData, error: profileError }] = await Promise.all([profilePromise, productsPromise, catalogsPromise]);

        if (profileError) console.error(`Error loading profile: ${profileError.message}`);

        if(profileData) {
            setProfile({ ...profileData, email: user.email || null });
        }
    } catch (error: any) {
        toast.error("Error", { description: `Hubo un error cargando los datos iniciales: ${error.message}`});
    } finally {
        setGlobalLoading(false);
    }
  }, [supabase, fetchProducts, fetchAllCatalogs]);

  useEffect(() => {
    const supabase = getSupabase();
    if(supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                fetchInitialProfile(session.user);
            }
        });
        return () => subscription.unsubscribe();
    }
  }, [fetchInitialProfile]);


  const uploadImage = async (file: File, userId: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase client not initialized.');

    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'tags' | 'category' | 'image_urls' | 'in_catalog' | 'user_id'>, imageFiles: File[]) => {
    setLoading(true);
    if (!supabase) {
        toast.error('Error', { description: 'Supabase client not initialized.' });
        setLoading(false);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.error('Error', { description: 'Debes iniciar sesión para añadir productos.' });
        setLoading(false);
        return;
    }

    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        imageUrls = await Promise.all(imageFiles.map(file => uploadImage(file, user.id)));
      } catch (error: any) {
        toast.error('Error de Carga', { description: error.message });
        setLoading(false);
        return;
      }
    } else {
      imageUrls = ['https://placehold.co/600x400.png'];
    }

    const { data: newProductData, error } = await supabase.from('products').insert({
      ...productData,
      user_id: user.id,
      image_urls: imageUrls,
    }).select().single();

    if (error) {
      toast.error('Error', { description: `No se pudo añadir el producto: ${error.message}` });
    } else {
      toast.success('Éxito', { description: 'Producto añadido correctamente.' });
      setProducts(prev => [formatProduct(newProductData), ...prev]);
    }
    setLoading(false);
  };

  const updateProduct = async (productId: string, updatedFields: Partial<Omit<Product, 'id' | 'image_urls' | 'createdAt' | 'tags' | 'category' | 'user_id' | 'in_catalog'>>, imageFiles: File[] = [], existingImageUrls: string[] = []) => {
      setLoading(true);
       if (!supabase) {
        toast.error('Error', { description: 'Supabase client not initialized.' });
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      let newImageUrls: string[] = [];
       if (imageFiles.length > 0) {
         try {
            newImageUrls = await Promise.all(imageFiles.map(file => uploadImage(file, user.id)));
         } catch(error: any) {
            toast.error('Error de Carga', { description: error.message });
            setLoading(false);
            return;
         }
       }
      
      const finalImageUrls = [...existingImageUrls, ...newImageUrls];
      
      if (finalImageUrls.length === 0) {
        finalImageUrls.push('https://placehold.co/600x400.png');
      }

      let updateData: any = { ...updatedFields, image_urls: finalImageUrls };
      
      const { data, error } = await supabase.from('products').update(updateData).eq('id', productId).eq('user_id', user.id).select().single();

      if (error) {
        toast.error('Error', { description: `No se pudo actualizar el producto: ${error.message}` });
      } else {
        toast.success('Éxito', { description: 'Producto actualizado.' });
        setProducts(prevProducts => prevProducts.map(p => p.id === productId ? formatProduct(data) : p));
      }
      setLoading(false);
  };

  const deleteProduct = async (productId: string) => {
    setLoading(true);
     if (!supabase) {
      toast.error('Error', { description: 'Supabase client not initialized.' });
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
       toast.error('Error', { description: `No se pudo eliminar el producto: ${error.message}` });
    } else {
       toast.success('Éxito', { description: 'Producto eliminado.' });
       setProducts(prev => prev.filter(p => p.id !== productId));
    }
    setLoading(false);
  };
  
  const createCatalog = async (name: string) => {
    setLoading(true);
    if (!supabase) {
      toast.error('Error', { description: 'Supabase client not initialized.' });
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('catalogs').insert({ name, user_id: user.id, is_public: true }).select().single();
    if (error) {
        toast.error('Error', { description: 'No se pudo crear el catálogo.' });
    } else {
        const newCatalog = { ...data, product_ids: [] };
        setCatalogs(prev => [...prev, newCatalog] as Catalog[]);
        setActiveCatalog(newCatalog as Catalog);
        toast.success('Éxito', { description: 'Catálogo creado.' });
    }
    setLoading(false);
  };

  const deleteCatalog = async (catalogId: string) => {
      setLoading(true);
       if (!supabase) {
        toast.error('Error', { description: 'Supabase client not initialized.' });
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('catalogs').delete().eq('id', catalogId);
      if (error) {
          toast.error('Error', { description: 'No se pudo eliminar el catálogo.' });
      } else {
          toast.success('Éxito', { description: 'Catálogo eliminado.' });
          const remainingCatalogs = catalogs.filter(c => c.id !== catalogId);
          setCatalogs(remainingCatalogs);
          setActiveCatalog(remainingCatalogs.length > 0 ? remainingCatalogs[0] : null);
      }
      setLoading(false);
  };

  const saveCatalog = async (catalogId: string, catalogData: { name: string; product_ids: string[]; is_public: boolean; }) => {
    setLoading(true);
     if (!supabase) {
      toast.error('Error', { description: 'Supabase client not initialized.' });
      setLoading(false);
      return;
    }
    const { name, product_ids, is_public } = catalogData;
    const { error: updateError } = await supabase.from('catalogs').update({ name, is_public }).eq('id', catalogId);
    if (updateError) {
        toast.error('Error', { description: 'No se pudo guardar el catálogo.' });
        setLoading(false);
        return;
    }

    await supabase.from('catalog_products').delete().eq('catalog_id', catalogId);
    if (product_ids.length > 0) {
        const { error: insertError } = await supabase.from('catalog_products').insert(
            product_ids.map(pid => ({ catalog_id: catalogId, product_id: pid }))
        );
        if (insertError) {
            toast.error('Error', { description: 'No se pudieron guardar los productos del catálogo.' });
            setLoading(false);
            return;
        }
    }
    
    const updatedCatalogs = await fetchAllCatalogs();
    if (updatedCatalogs) {
      const updatedCurrentCatalog = updatedCatalogs.find(c => c.id === catalogId);
      if(updatedCurrentCatalog) setActiveCatalog(updatedCurrentCatalog as Catalog);
    }
    toast.success('Éxito', { description: 'Catálogo guardado.' });
    setLoading(false);
  };

  const contextValue = {
    products,
    catalogs,
    activeCatalog,
    profile,
    loading,
    globalLoading,
    fetchProducts,
    fetchInitialProfile,
    addProduct,
    updateProduct,
    deleteProduct,
    setActiveCatalog,
    saveCatalog,
    createCatalog,
    deleteCatalog
  };

  return (
    <ProductContext.Provider value={contextValue}>
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
