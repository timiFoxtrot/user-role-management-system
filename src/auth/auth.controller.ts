import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ErrorResponse, SuccessResponse } from '../common/helpers/response';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login-auth.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: 'Register a user'})
  @ApiBody({ type:  CreateAuthDto})
  @ApiResponse({ status: 201, description: 'Signup successful' })
  async register(@Body() CreateAuthDto: CreateAuthDto) {
    try {
      const response = await this.authService.register(CreateAuthDto)
      return SuccessResponse('User Created Successfully', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to create user',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({summary: 'Login a user'})
  @ApiBody({ type:  LoginDto})
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginUserDto: LoginDto) {
    try {
      const response = await this.authService.login(loginUserDto)
      return SuccessResponse('Login successful', { data: response }, 200);
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to login',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
