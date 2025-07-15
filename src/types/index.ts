

export interface Product {
  id: string; // uuid
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  visible: boolean;
  image: string;
  createdAt: string;
  tags: string[];
  category: string;
  in_catalog: boolean;
  user_id: string; // uuid
}

export interface Catalog {
    id: string; // uuid
    user_id: string; // uuid
    name: string;
    created_at: string;
    product_ids: string[]; // Array of product UUIDs
    is_public: boolean;
}

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
  role?: string;
};
