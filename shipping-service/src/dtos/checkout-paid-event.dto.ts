export interface CheckoutPaidEventDto {
  id: string;
  address: ShippingAddressDto;
}

export interface ShippingAddressDto {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}