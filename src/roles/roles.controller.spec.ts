import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { SuccessResponse, ErrorResponse } from '../common/helpers/response';
import { HttpStatus } from '@nestjs/common';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            createRole: jest.fn(),
            findRoles: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRoles', () => {
    it('should fetch all roles successfully', async () => {
      const mockRoles = [
        {
          id: 1,
          name: 'Admin',
          permissions: ['read', 'write'],
        },
        {
          id: 2,
          name: 'User',
          permissions: ['read'],
        },
      ];

      jest.spyOn(rolesService, 'findRoles').mockResolvedValue(mockRoles);

      const result = await controller.getAllRoles();

      expect(rolesService.findRoles).toHaveBeenCalled();
      expect(result).toEqual(
        SuccessResponse('Roles fetched Successfully', { data: mockRoles }),
      );
    });

    it('should handle errors when fetching roles', async () => {
      jest
        .spyOn(rolesService, 'findRoles')
        .mockRejectedValue(new Error('Unable to fetch roles'));

      try {
        await controller.getAllRoles();
      } catch (error) {
        expect(error).toEqual(
          ErrorResponse(
            'Unable to fetch roles',
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
        );
      }
    });
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const createRoleDto = {
        name: 'User',
        permissions: ['read'],
      };

      const mockResponse = {
        id: 2,
        name: 'User',
        permissions: ['read'],
      };

      jest.spyOn(rolesService, 'createRole').mockResolvedValue(mockResponse);

      const result = await controller.create(createRoleDto);

      expect(rolesService.createRole).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(
        SuccessResponse('Role created Successfully', { data: mockResponse }),
      );
    });

    it('should handle errors when creating a role', async () => {
      const createRoleDto = {
        name: 'User',
        permissions: ['read'],
      };

      jest
        .spyOn(rolesService, 'createRole')
        .mockRejectedValue(new Error('Unable to create role'));

      try {
        await controller.create(createRoleDto);
      } catch (error) {
        expect(error).toEqual(
          ErrorResponse(
            'Unable to create role',
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
        );
      }
    });
  });
});
