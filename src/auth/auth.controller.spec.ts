import { Test, TestingModule } from '@nestjs/testing';
import { ErrorResponse, SuccessResponse } from '../common/helpers/response';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const createAuthDto: CreateAuthDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
        roles: ['user'],
      };

      const mockResponse = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResponse);

      const result = await controller.register(createAuthDto);
      
      expect(authService.register).toHaveBeenCalledWith(createAuthDto);
      expect(result).toEqual(SuccessResponse('User Created Successfully', { data: mockResponse }));
    });

    it('should handle errors when registering a user', async () => {
      const createAuthDto: CreateAuthDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
        roles: ['user'],
      };

      jest.spyOn(authService, 'register').mockRejectedValue(new Error('User already exists'));

      try {
        await controller.register(createAuthDto);
      } catch (error) {
        expect(error).toEqual(ErrorResponse('User already exists', HttpStatus.UNPROCESSABLE_ENTITY));
      }
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginUserDto = {
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      const mockResponse = {
        access_token: 'someJwtToken',
      };
      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      const result = await controller.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(SuccessResponse('Login successful', { data: mockResponse }));
    });

    it('should handle errors when logging in', async () => {
      const loginUserDto = {
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      try {
        await controller.login(loginUserDto);
      } catch (error) {
        expect(error).toEqual(ErrorResponse('Invalid credentials', HttpStatus.UNPROCESSABLE_ENTITY));
      }
    });
  });
});
