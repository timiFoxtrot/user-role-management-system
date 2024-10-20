import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsStrongPassword,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'name is required' })
  @Transform((val) => val.value.trim())
  firstName: string;

  @IsNotEmpty({ message: 'name is required' })
  @Transform((val) => val.value.trim())
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, a number, a special character, and minimum of 8 characters',
    },
  )
  password: string;

  @IsOptional()
  @IsArray()
  roles?: string[];
}
