// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';

// describe('UsersService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user when a valid email is provided', async () => {
      const mockUser = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findOneByEmail('notfound@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users without passwordHash', async () => {
      const mockUsers: any = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          createdAt: new Date(),
          roles: [
            {
              id: 1,
              name: 'Admin',
              permissions: ['read', 'write'],
            },
          ],
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          createdAt: new Date(),
          roles: [
            {
              id: 2,
              name: 'User',
              permissions: ['read'],
            },
          ],
        },
      ];
  
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);
  
      const result = await service.findAll();
  
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          roles: true,
        },
      });
  
      // Asserting that the result matches the mock users
      expect(result).toEqual(mockUsers);
    });
  });
  

  describe('assignRole', () => {
    it('should assign a role to a user successfully', async () => {
      const mockUser = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };
      const mockRole = { id: 2, name: 'User', permissions: [] };
      const mockUpdatedUser: any = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        roles: [{ id: 2, name: 'User', permissions: [] }],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(mockRole);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUpdatedUser);

      const result = await service.assignRole({ userId: 1, roleId: 2 });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { roles: { connect: { id: 2 } } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          roles: true,
        },
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.assignRole({ userId: 1, roleId: 2 }),
      ).rejects.toThrow(new NotFoundException('User with id 1 not found'));
    });

    it('should throw NotFoundException if role is not found', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(null);

      await expect(
        service.assignRole({ userId: 1, roleId: 2 }),
      ).rejects.toThrow(new NotFoundException('Role with id 2 not found'));
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser);

      const result = await service.remove(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('User with id 1 not found'),
      );
    });
  });
});
