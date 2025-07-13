
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
  in_catalog: boolean;
  // user_id is a uuid string, but we don't need to expose it to most components.
}
