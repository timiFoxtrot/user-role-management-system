import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @Transform((val) => val.value.toLowerCase())
  @IsNotEmpty({
    message: 'Email is required',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Pass@123!',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  password: string;
}
