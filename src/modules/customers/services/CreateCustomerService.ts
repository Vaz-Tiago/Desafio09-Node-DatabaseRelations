import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const checkEmail = await this.customersRepository.findByEmail(email);

    if (checkEmail) {
      throw new AppError('email already in use');
    }

    const custumer = this.customersRepository.create({ name, email });

    return custumer;
  }
}

export default CreateCustomerService;