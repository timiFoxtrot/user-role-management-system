import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const createRoleDto: CreateRoleDto = { name: 'Admin', permissions: ['read', 'write'] };

      const mockRole = { id: 1, name: 'Admin', permissions: ['read', 'write'] };

      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.role, 'create').mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'Admin' } });
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: 'Admin', permissions: ['read', 'write'] },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw a ConflictException if the role already exists', async () => {
      const createRoleDto: CreateRoleDto = { name: 'Admin', permissions: ['read', 'write'] };

      const existingRole = { id: 1, name: 'Admin', permissions: ['read', 'write'] };

      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(existingRole);

      await expect(service.createRole(createRoleDto)).rejects.toThrow(
        new ConflictException('Role already exists'),
      );

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'Admin' } });
      expect(prisma.role.create).not.toHaveBeenCalled();
    });
  });

  describe('findRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin', permissions: ['read', 'write'] },
        { id: 2, name: 'User', permissions: ['read'] },
      ];

      jest.spyOn(prisma.role, 'findMany').mockResolvedValue(mockRoles);

      const result = await service.findRoles();

      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
  });
});

