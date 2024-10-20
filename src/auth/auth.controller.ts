import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
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
  async login(@Body() loginUserDto: {email: string, password: string}) {
    try {
      const response = await this.authService.login(loginUserDto)
      return SuccessResponse('Login successful', { data: response });
    } catch (error) {
      throw ErrorResponse(
        error.message || 'Unable to login',
        error.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
