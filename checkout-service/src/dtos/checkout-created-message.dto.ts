export interface CheckoutCreatedMessage {
  id: string;
  items: any[];
  total: number;
  address: string;
  status: string;
}