import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/auth.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin') // Only Admin can access this endpoint
  async getAllUsers() {
    try {
      const response = await this.usersService.findAll();
      return SuccessResponse('Users fetched Successfully', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to fetch users',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('assign-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin') // Only Admin can assign roles
  async assignRole(@Body() assignRoleDto: { userId: string; roleId: string }) {
    try {
      const response = await this.usersService.assignRole({
        userId: Number(assignRoleDto.userId),
        roleId: Number(assignRoleDto.roleId),
      });
      return SuccessResponse("User's role updated", { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || "Unable to update user's role",
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin') // Only Admin can delete users
  async deleteUser(@Param('id') id: string) {
    try {
      const response = await this.usersService.remove(Number(id));
      console.log({response})
      return SuccessResponse('User deleted', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable delete user',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
