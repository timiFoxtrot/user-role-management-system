import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { ErrorResponse, SuccessResponse } from '../common/helpers/response';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            assignRole: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [
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
      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(
        SuccessResponse('Users fetched Successfully', { data: mockUsers }),
      );
    });

    it('should handle errors when fetching users', async () => {
      jest
        .spyOn(usersService, 'findAll')
        .mockRejectedValue(new Error('Unable to fetch users'));

      try {
        await controller.getAllUsers();
      } catch (error) {
        expect(error).toEqual(
          ErrorResponse(
            'Unable to fetch users',
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
        );
      }
    });
  });

  describe('assignRole', () => {
    it('should assign role to a user successfully', async () => {
      const assignRoleDto = { userId: '1', roleId: '2' };
      const mockResponse = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roles: [
          {
            id: 2,
            name: 'User',
            permissions: ['read'],
          },
        ],
      };
      jest.spyOn(usersService, 'assignRole').mockResolvedValue(mockResponse);

      const result = await controller.assignRole(assignRoleDto);

      expect(usersService.assignRole).toHaveBeenCalledWith({
        userId: 1,
        roleId: 2,
      });
      expect(result).toEqual(
        SuccessResponse("User's role updated", { data: mockResponse }),
      );
    });

    it('should handle errors when assigning role', async () => {
      const assignRoleDto = { userId: '1', roleId: '2' };
      jest
        .spyOn(usersService, 'assignRole')
        .mockRejectedValue(new Error("Unable to update user's role"));

      try {
        await controller.assignRole(assignRoleDto);
      } catch (error) {
        expect(error).toEqual(
          ErrorResponse(
            "Unable to update user's role",
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
        );
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const userId = '1';
      const mockResponse = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };
      jest.spyOn(usersService, 'remove').mockResolvedValue(mockResponse);

      const result = await controller.deleteUser(userId);

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        SuccessResponse('User deleted', { data: mockResponse }),
      );
    });

    it('should handle errors when deleting a user', async () => {
      const userId = '1';
      jest
        .spyOn(usersService, 'remove')
        .mockRejectedValue(new Error('Unable to delete user'));

      try {
        await controller.deleteUser(userId);
      } catch (error) {
        expect(error).toEqual(
          ErrorResponse(
            'Unable to delete user',
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
        );
      }
    });
  });
});
