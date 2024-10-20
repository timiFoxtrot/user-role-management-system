import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  permissions: string[];
}
