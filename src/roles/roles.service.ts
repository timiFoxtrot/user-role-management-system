import { Injectable, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;

    const existingRole = await this.prisma.role.findUnique({
      where: {
        name
      }
    })

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    return this.prisma.role.create({
      data: {
        name,
        permissions,
      },
    });
  }

  async findRoles() {
    return this.prisma.role.findMany()
  }
}
