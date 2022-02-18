import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import TestUtil from '../../src/common/test/TestUtil';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    mockRepository.find.mockReset();
    mockRepository.findOne.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.update.mockReset();
    mockRepository.remove.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should be list all users', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.find.mockReturnValue([user, user]);

      const users = await service.findAll();

      expect(users).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a exception when does not to find a user', async () => {
      mockRepository.findOne.mockReturnValue(null);

      expect(
        service.findById('4378b226-90b5-11ec-b909-0242ac120003'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should find a existing user', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.findOne.mockReturnValue(user);

      const foundUser = await service.findById(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(foundUser).toMatchObject({
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should return a exception when user already exists', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.findOne.mockReturnValue(user);

      expect(service.create(user)).rejects.toBeInstanceOf(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should create a user', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockReturnValue(user);

      const savedUser = await service.create(user);

      expect(savedUser).toBeTruthy();
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should return a exception when does not to find a user', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.findOne.mockReturnValue(null);

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
      const user = TestUtil.getValidUser();

      mockRepository.findOne.mockReturnValue(user);
      mockRepository.update.mockReturnValue({
        affected: 1,
      });

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
      mockRepository.findOne.mockReturnValue(null);

      expect(
        service.delete('4378b226-90b5-11ec-b909-0242ac120003'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should delete a user', async () => {
      const user = TestUtil.getValidUser();

      mockRepository.findOne.mockReturnValue(user);
      mockRepository.remove.mockReturnValue(user);

      const removeUser = await service.delete(
        '4378b226-90b5-11ec-b909-0242ac120002',
      );

      expect(removeUser).toBeTruthy();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
