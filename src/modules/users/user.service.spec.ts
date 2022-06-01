import {
  CacheModule,
  CACHE_MANAGER,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import TestUtil from '../../common/test/TestUtil';
import { DatabaseModule } from '../../database/database.module';
import { RedisCacheService } from '../../database/services/redis-cache.service';

const user = TestUtil.getValidUser();

const mockRepository = {
  find: jest.fn().mockReturnValue([user, user]),
  findOne: jest.fn().mockReturnValue(user),
  create: jest.fn().mockReturnValue(user),
  save: jest.fn().mockReturnValue(user),
  update: jest.fn().mockReturnValue({
    affected: 1,
  }),
  remove: jest.fn().mockReturnValue(user),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let cacheManager: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({}), DatabaseModule],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: RedisCacheService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    cacheManager = module.get<any>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be list all users', async () => {
      const users = await service.findAll();

      expect(users).toEqual([user, user]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a cached user', async () => {
      jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(user);

      const foundUser = await service.findById(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(foundUser).toEqual(user);
      expect(mockRedisService.get).toHaveBeenCalledTimes(1);
    });

    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);
      jest.spyOn(mockRedisService, 'get').mockReturnValueOnce(null);
      jest.spyOn(mockRedisService, 'set').mockReturnValueOnce(true);

      await service
        .findById('4378b226-90b5-11ec-b909-0242ac120003')
        .catch((e) => {
          expect(e).toBeInstanceOf(NotFoundException);
        });
    });

    it('should find a existing user by id', async () => {
      const foundUser = await service.findById(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(foundUser).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUsername', () => {
    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      await service.findByUsername('dudubernardino').catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
      });
    });

    it('should find a existing user by username', async () => {
      const foundUser = await service.findByUsername('dudubernardino');

      expect(foundUser).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should return an exception when user already exists', async () => {
      await service.create(user).catch((e) => {
        expect(e).toBeInstanceOf(ConflictException);
      });
    });

    it('should return an expection when doesnt create a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);
      jest.spyOn(mockRepository, 'save').mockReturnValueOnce(null);

      await service.create(user).catch((e) => {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      });
    });

    it('should create a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      const savedUser = await service.create(user);

      expect(savedUser).toEqual(true);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      await service
        .update({
          userId: user.id,
          name: user.name,
          username: user.username,
          password: user.password,
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(NotFoundException);
        });
    });

    it('should update a user', async () => {
      jest.spyOn(mockRedisService, 'get').mockResolvedValueOnce(user);

      const updatedUser = await service.update({
        userId: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
      });

      expect(updatedUser).toBeTruthy();
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      await service
        .delete('4378b226-90b5-11ec-b909-0242ac120003')
        .catch((e) => {
          expect(e).toBeInstanceOf(NotFoundException);
        });
    });

    it('should return an expection when doesnt delete a user', async () => {
      jest.spyOn(mockRepository, 'remove').mockReturnValueOnce(null);

      await service
        .delete('4378b226-90b5-11ec-b909-0242ac120002')
        .catch((e) => {
          expect(e).toBeInstanceOf(InternalServerErrorException);
        });
    });

    it('should delete a user', async () => {
      const removeUser = await service.delete(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(removeUser).toEqual(true);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
