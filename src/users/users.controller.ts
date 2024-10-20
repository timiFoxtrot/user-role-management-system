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
import { RolesGuard } from '../auth/auth.guard';
import { ErrorResponse, SuccessResponse } from '../common/helpers/response';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignRoleDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({summary: 'Fetch all users'})
  @ApiResponse({ status: 200, description: 'Users list' })
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
  @ApiOperation({summary: 'Assign role to user'})
  @ApiBody({ type:  AssignRoleDto})
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
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
  @ApiOperation({summary: 'Delete a user'})
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') id: string) {
    try {
      const response = await this.usersService.remove(Number(id));
      return SuccessResponse('User deleted', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable delete user',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
