import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ErrorResponse, SuccessResponse } from '../common/helpers/response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    try {
      const response = await this.rolesService.createRole(createRoleDto);
      return SuccessResponse('Role created Successfully', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to create role',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Fetch all roles' })
  @ApiResponse({ status: 200, description: 'Roles list' })
  async getAllRoles() {
    try {
      const response = await this.rolesService.findRoles();
      return SuccessResponse('Roles fetched Successfully', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to fetch roles',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
