import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async assignRole(assignRoleDto: {userId: number, roleId: number}) {
    const { userId, roleId } = assignRoleDto;

     const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roles: { connect: { id: roleId } } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true
      }
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        roles: true
      }
    });
  }

  async remove(id: number) {
    try {
      const deletedUser =  await this.prisma.user.delete({
        where: {
          id,
        },
      });

      return deletedUser
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }
}
