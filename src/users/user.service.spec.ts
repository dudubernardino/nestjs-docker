import {
  CACHE_MANAGER,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisCacheService } from 'src/database/services/redis-cache.service';
import TestUtil from '../../src/common/test/TestUtil';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Cache } from 'cache-manager';

const user = TestUtil.getValidUser();

describe('UserService', () => {
  let service: UserService;
  let cache: Cache;
  let redis: RedisCacheService;

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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => 'any value',
            set: () => jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    cache = module.get(CACHE_MANAGER);
    redis = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(cache).toBeDefined();
    expect(redis).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be list all users', async () => {
      const users = await service.findAll();

      expect(users).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      expect(
        service.findById('4378b226-90b5-11ec-b909-0242ac120003'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should find a existing user by id', async () => {
      const foundUser = await service.findById(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(foundUser).toMatchObject({
        id: user.id,
        name: user.name,
        username: user.username,
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUsername', () => {
    it('should return a exception when does not to find a user', () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      expect(service.findByUsername('dudubernardino')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toBeCalledTimes(1);
    });

    it('should find a existing user by username', async () => {
      const foundUser = await service.findByUsername('dudubernardino');

      expect(foundUser).toMatchObject({
        id: user.id,
        name: user.name,
        username: user.username,
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should return a exception when user already exists', async () => {
      expect(service.create(user)).rejects.toBeInstanceOf(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should create a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      const savedUser = await service.create(user);

      expect(savedUser).toBeTruthy();
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should return a exception when does not to find a user', async () => {
      jest.spyOn(mockRepository, 'findOne').mockReturnValueOnce(null);

      expect(
        service.update({
          userId: user.id,
          name: user.name,
          username: user.username,
          password: user.password,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update a user', async () => {
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

      expect(
        service.delete('4378b226-90b5-11ec-b909-0242ac120003'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should delete a user', async () => {
      const removeUser = await service.delete(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(removeUser).toBeTruthy();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
