import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateHash, validateHash } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(data: CreateAuthDto) {
    const hashedPassword = await generateHash(data.password);
    const isEmailExist = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if(isEmailExist) throw new Error('Email already exists')

    const roles = await this.prisma.role.findMany({
      where: {
        name: { in: data.roles || [] }, // Use the roles passed in, or an empty array if none are provided
      },
    });

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: hashedPassword,
        roles: {
          connect: roles.map((role) => ({ id: role.id })), // Connect roles by their IDs
        },
      },
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credential');
    }

    const isPasswordValid = await validateHash(pass, user.passwordHash);
    if (user && isPasswordValid) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.validateUser(data.email, data.password);
    if (!user) {
      throw new BadRequestException('Invalid credential');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles.map((role) => role.name),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
