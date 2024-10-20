import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

jest.setTimeout(30000); // Set timeout to 30 seconds

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mockToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET, // Provide a mock secret here
          signOptions: { expiresIn: '1h' },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate a mock token for the test
    mockToken = jwtService.sign({
      email: 'foxtrot@example.com',
      sub: createdUserId,
      roles: ['Admin'],
    }); // Adjust payload as necessary
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Testing the root route (GET /)
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Test for user registration (POST /auth/register)
  it('/auth/register (POST)', async () => {
    const userData = {
      firstName: 'Foxtrot',
      lastName: 'Doe',
      email: 'foxtrot@example.com',
      password: 'StrongPassword123!',
    };

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('User Created Successfully');
        expect(res.body.data).toHaveProperty('email', 'foxtrot@example.com');
        createdUserId = res.body.data.id;
      });
  });

  // Test for user login (POST /auth/login)
  it('/auth/login (POST)', async () => {
    const loginData = {
      email: 'foxtrot@example.com',
      password: 'StrongPassword123!',
    };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Login successful');
        expect(res.body.data).toHaveProperty('access_token');
      });
  });

  // Test for fetching all users (GET /users)
  it('/users (GET)', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Users fetched Successfully');
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });

  // Test for assigning a role to a user (POST /users/assign-role)
  it('/users/assign-role (POST)', async () => {
    const roleData = {
      userId: 1,
      roleId: 2,
    };

    return request(app.getHttpServer())
      .post('/users/assign-role')
      .set('Authorization', `Bearer ${mockToken}`)
      .send(roleData)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe("User's role updated");
        expect(res.body.data).toHaveProperty('id', roleData.userId);
      });
  });

  // Test for creating a role (POST /roles)
  it('/roles (POST)', async () => {
    const roleData = {
      name: 'Admin-Test',
      permissions: ["Write", "Read", "Delete", "Update"]
    };

    return request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${mockToken}`)
      .send(roleData)
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Role created Successfully');
        expect(res.body.data).toHaveProperty('name', 'Admin-Test');
      });
  });

  // Test for fetching all roles (GET /roles)
  it('/roles (GET)', async () => {
    return request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Roles fetched Successfully');
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });

  it('/users/:id (DELETE)', async () => {
    return request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${mockToken}`) // Assuming JWT is required
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('User deleted');
        expect(res.body.data).toHaveProperty('id', createdUserId); // Ensure the response has the deleted user's ID
      });
  });
});
