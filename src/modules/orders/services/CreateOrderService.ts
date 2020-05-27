/* eslint-disable no-param-reassign */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository, {
  IFindProducts,
} from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import { IProduct } from '@modules/orders/dtos/ICreateOrderDTO';

import IOrdersRepository from '../repositories/IOrdersRepository';
import IOrderProductsDTO from '../dtos/IOrderProductsDTO';
import IOrderResponseDTO from '../dtos/IOrderResponseDTO';

interface IProductRequest {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProductRequest[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products,
  }: IRequest): Promise<IOrderResponseDTO> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer not found.');
    }

    const productsId = products.map(item => {
      const product: IFindProducts = { id: item.id };
      return product;
    });

    const orderProducts = await this.productsRepository.findAllById(productsId);
    if (orderProducts.length !== products.length) {
      throw new AppError('Product not found.');
    }

    const productsList = Array<IProduct>();

    products.forEach(item => {
      const checkPrice = orderProducts.find(product => product.id === item.id);
      if (!checkPrice) {
        throw new AppError('Price not check');
      }
      const productItem: IProduct = {
        product_id: item.id,
        price: checkPrice.price,
        quantity: item.quantity,
      };
      productsList.push(productItem);
    });

    products.forEach(item => {
      const compareQuantity = orderProducts.find(
        element => element.id === item.id,
      );
      if (compareQuantity && compareQuantity?.quantity < item.quantity) {
        throw new AppError(`${compareQuantity.name} is out of order.`);
      }
    });
    await this.productsRepository.updateQuantity(products);

    const createOrder = await this.ordersRepository.create({
      customer,
      products: productsList,
    });

    const orderProductsResponse: Array<IOrderProductsDTO> = createOrder.order_products.map(
      item => {
        const quantity = products.find(prod => prod.id === item.product_id)
          ?.quantity;
        if (!quantity) {
          throw new AppError('Quantity not found');
        }
        const retorno = {
          price: item.price,
          product_id: item.product_id,
          quantity,
        };

        return retorno;
      },
    );

    const order: IOrderResponseDTO = {
      id: createOrder.id,
      customer: {
        email: createOrder.customer.email,
        id: createOrder.customer.id,
        name: createOrder.customer.name,
      },
      order_products: orderProductsResponse,
    };

    return order;
  }
}

export default CreateOrderService;
