

export interface Product {
  id: number; // This is a bigint in the DB, so number is appropriate here.
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
  in_catalog: boolean; // This might be deprecated with the new system
  user_id: string; // uuid
}

export interface Catalog {
    id: string; // uuid
    user_id: string; // uuid
    name: string;
    template_id: string;
    created_at: string;
    product_ids: number[]; // Not in DB, but we'll populate it in the context
}

    