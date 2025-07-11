export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  tags: ('New' | 'Offer' | 'Out of Stock')[];
  visible: boolean;
  category: string;
  createdAt: string;
};
