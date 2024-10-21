import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { generateHash, validateHash } from '../common/utils';

jest.mock('../common/utils');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            role: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        roles: [{ id: 1, name: 'Admin' }],
      };

      const createAuthDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['Admin'],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.role, 'findMany').mockResolvedValue([{ id: 1, name: 'Admin', permissions: [] }]);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      (generateHash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(createAuthDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: createAuthDto.email } });
      expect(prisma.role.findMany).toHaveBeenCalledWith({ where: { name: { in: ['Admin'] } } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: createAuthDto.firstName,
          lastName: createAuthDto.lastName,
          email: createAuthDto.email,
          passwordHash: 'hashed_password',
          roles: { connect: [{ id: 1 }] },
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if email already exists', async () => {
      const createAuthDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['Admin'],
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        roles: [{ id: 1, name: 'Admin' }],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.register(createAuthDto)).rejects.toThrow('Email already exists');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: createAuthDto.email } });
    });
  });

  describe('validateUser', () => {
    it('should return user data without password hash on valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        roles: [{ id: 1, name: 'Admin' }],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      (validateHash as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { roles: true },
      });
      expect(validateHash).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        roles: [{ id: 1, name: 'Admin' }],
      });
    });

    it('should throw a BadRequestException on invalid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'password123')).rejects.toThrow(
        new BadRequestException('Invalid credential'),
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [{ id: 1, name: 'Admin' }],
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('signed_jwt_token');

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(service.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
        roles: ['Admin'],
      });
      expect(result).toEqual({ access_token: 'signed_jwt_token' });
    });

    it('should throw a BadRequestException on invalid login', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password123' })).rejects.toThrow(
        new BadRequestException('Invalid credential'),
      );
    });
  });
});
