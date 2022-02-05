import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * @function create
   * @description Cria um usuário
   * @param {CreateUserInput} data - Parâmetros do usuário
   * @returns {boolean}
   */
  async create(data: CreateUserInput): Promise<boolean> {
    const userAlreadyExists = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (userAlreadyExists) throw new ConflictException('Usuário já existe');

    const user = this.userRepository.create(data);

    const result = await this.userRepository.save(user);

    return result ? true : false;
  }

  /**
   * @function update
   * @description Atualiza um usuário
   * @param {CreateUserInput} data - Parâmetros do usuário
   * @returns {boolean}
   */
  async update(data: UpdateUserInput): Promise<boolean> {
    const user = await this.userRepository.findOne(data.userId);

    if (!user)
      throw new NotFoundException(
        `Usuário com ID ${data.userId} não encontrado`,
      );

    const result = await this.userRepository.update(
      {
        id: data.userId,
      },
      {
        name: data.name,
        username: data.username,
        password: data.password,
      },
    );

    return result.affected > 0;
  }

  /**
   * @function findAll
   * @description Retorna os usuários
   * @returns {User[]}
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'username'],
    });
  }

  /**
   * @function findOne
   * @description Retorna um usuário
   * @param {string} userId - Id do usuário
   * @returns {User}
   */
  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne(userId, {
      select: ['id', 'name', 'username'],
    });

    if (!user)
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);

    return user;
  }

  /**
   * @function delete
   * @description Exclui um usuário
   * @param {string} userId - Id do usuário
   * @returns {boolean}
   */
  async delete(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne(userId);

    if (!user)
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);

    const result = await this.userRepository.remove(user);

    return result ? true : false;
  }
}
