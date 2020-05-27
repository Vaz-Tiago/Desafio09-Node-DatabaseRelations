import IOrderProductsDTO from './IOrderProductsDTO';

export default interface IOrderResponseDTO {
  id: string;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  order_products: Array<IOrderProductsDTO>;
}
