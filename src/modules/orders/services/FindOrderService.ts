import { inject, injectable } from 'tsyringe';

// import IProductsRepository from '@modules/products/repositories/IProductsRepository';
// import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import AppError from '@shared/errors/AppError';
import IOrdersRepository from '../repositories/IOrdersRepository';
import IOrderResponseDTO from '../dtos/IOrderResponseDTO';
import IOrderProductsDTO from '../dtos/IOrderProductsDTO';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository, // @inject('ProductsRepository') // private productsRepository: IProductsRepository, // @inject('CustomersRepository') // private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<IOrderResponseDTO> {
    const findOrder = await this.ordersRepository.findById(id);

    if (!findOrder) {
      throw new AppError('Order not found');
    }

    const orderProductsResponse: Array<IOrderProductsDTO> = findOrder.order_products.map(
      item => {
        const product = {
          price: item.price,
          product_id: item.product_id,
          quantity: item.quantity,
        };

        return product;
      },
    );

    const order: IOrderResponseDTO = {
      id: findOrder.id,
      customer: {
        email: findOrder.customer.email,
        id: findOrder.customer.id,
        name: findOrder.customer.name,
      },
      order_products: orderProductsResponse,
    };

    return order;
  }
}

export default FindOrderService;
