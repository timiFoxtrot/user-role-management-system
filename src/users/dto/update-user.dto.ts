import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'The id of the user' })
  @IsNotEmpty({ message: 'userId is required' })
  @Transform((val) => val.value.trim())
  userId: string;
  
  @ApiProperty({ description: 'The role id' })
  @IsNotEmpty({ message: 'roleId is required' })
  @Transform((val) => val.value.trim())
  roleId: string;
}
