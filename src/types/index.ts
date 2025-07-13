
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  visible: boolean;
  image: string; // This will now be the public URL from Supabase Storage
  createdAt: string;
  tags: string[];
  category: string;
  in_catalog: boolean;
}

    