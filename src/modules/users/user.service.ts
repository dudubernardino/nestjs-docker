import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheService } from '../../database/services/redis-cache.service';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly redis: RedisCacheService,
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

    if (!result)
      throw new InternalServerErrorException(
        'Não foi possível criar o usuário',
      );

    return true;
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

    const getUserByCache = await this.redis.get(`User-${data.userId}`);

    if (getUserByCache) await this.redis.del(`User-${data.userId}`);

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
   * @function findById
   * @description Retorna um usuário pelo Id
   * @param {string} userId - Id do usuário
   * @returns {User}
   */
  async findById(userId: string): Promise<User> {
    const getUserByCache = await this.redis.get(`User-${userId}`);

    if (getUserByCache) return getUserByCache;

    const user = await this.userRepository.findOne(userId, {
      select: ['id', 'name', 'username', 'refreshToken'],
    });

    if (!user)
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);

    await this.redis.set(`User-${userId}`, user);

    return user;
  }

  /**
   * @function findByUsername
   * @description Retorna um usuário pelo username
   * @param {string} username - username do usuário
   * @returns {User}
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'name', 'username', 'password'],
    });

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

    if (!result)
      throw new InternalServerErrorException(
        'Não foi possível remover o usuário',
      );

    return true;
  }
}
