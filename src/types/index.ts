

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
    template_id: string;
    created_at: string;
    product_ids: string[]; // Array of product UUIDs
}
