import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { BlackListRepository } from '../src/modules/auth/black-list.repository';
import { UsersRepository } from '../src/modules/users/users.repository';
import { User } from '../src/schemas/users.schema';
import { JwtPassService } from '../src/modules/jwt-pass/jwt-pass.service';
import { fakerConnectDb } from '../src/test-params/fake-connect-db';
import { newUser1, adminToken, newUser2 } from '../src/test-params/test-values';

describe('test user-router "/auth"', () => {
  let userRepo: UsersRepository;
  let jwtPassService: JwtPassService;
  let app;
  let blackListRepository: BlackListRepository;
  const bodyParams = {
    login: newUser1.login,
    password: newUser1.password,
    email: newUser1.email,
  };
  let token: string;
  let newUser: User;
  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userRepo = moduleFixture.get<UsersRepository>(UsersRepository);
    jwtPassService = moduleFixture.get<JwtPassService>(JwtPassService);
    blackListRepository =
      moduleFixture.get<BlackListRepository>(BlackListRepository);

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
    const agent = request(app.getHttpServer());
    await agent
      .post('/users')
      .set('Authorization', `Basic ${adminToken.correct}`)
      .send(bodyParams);
    newUser = (await userRepo.getUserByEmail(newUser1.email)) as User;
    token = await jwtPassService.createJwt(
      newUser._id,
      process.env.EXPIRED_REFRESH,
    );
  });
  afterAll(() => {
    disconnect();
  });

  describe('test post  "/registration" endpoint', () => {
    it('should add new user', () => {
      const bodyParams2 = {
        login: newUser2.login,
        password: newUser2.password,
        email: newUser2.email,
      };
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send(bodyParams2);
      // .expect(204);
    });
  });

  describe('test post  "/refresh-token" endpoint', () => {
    it('should return new refresh token in headers and access token in body', async () => {
      const cookie = `refreshToken=${token}; Path=/; Secure; HttpOnly;`;
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookie)
        .expect(200)
        .then(async (res) => {
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.headers['set-cookie'][0]).toBe('string');
        });
    });

    it('should return error when send 2 times the same refresh token', async () => {
      const cookie = `refreshToken=${token}; Path=/; Secure; HttpOnly;`;
      const agent = request(app.getHttpServer());
      await agent.post('/auth/refresh-token').set('Cookie', cookie);

      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookie)
        .expect(401);
    });
  });

  describe('test post  "/login" endpoint', () => {
    it('should success login and return new refresh token in headers and access token in body', async () => {
      // console.log(newUser);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: newUser1.login, password: newUser1.password })
        .expect(200)
        .then(async (res) => {
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.headers['set-cookie'][0]).toBe('string');
        });
    });
  });

  describe('test post  "/registration-email-resending" endpoint', () => {
    it('should resend email and change confirmation code', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({ email: newUser1.email })
        .expect(204)
        .then(async () => {
          const changedUser = (await userRepo.getUserByEmail(
            newUser1.email,
          )) as User;
          expect(changedUser.emailConfirmation.confirmationCode).not.toBe(
            newUser.emailConfirmation.confirmationCode,
          );
        });
    });
    it('should return un authorization Error 401', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({ email: 'incorrect@mail.con' })
        .expect(401);
    });
  });

  describe('test post  "/new-password" endpoint', () => {
    it('should change hash password on new', async () => {
      const bodyParams = {
        newPassword: 'qwerty',
        recoveryCode: newUser.emailConfirmation.confirmationCode,
      };
      return request(app.getHttpServer())
        .post('/auth/new-password')
        .send(bodyParams)
        .expect(204)
        .then(async () => {
          const changedUser = (await userRepo.getUserByEmail(
            newUser1.email,
          )) as User;
          expect(changedUser.accountData.passwordHash).not.toBe(
            newUser.accountData.passwordHash,
          );
        });
    });
  });

  describe('test post  "/logout" endpoint', () => {
    it('should add toke in black list on second request throw error', async () => {
      const cookie = `refreshToken=${token}; Path=/; Secure; HttpOnly;`;
      const agent = request(app.getHttpServer());
      await agent
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(204)
        .then(async () => {
          const newToken = await blackListRepository.checkToken(token);
          expect(newToken).toBeTruthy();
        });

      await agent.post('/auth/logout').set('Cookie', cookie).expect(401);
    });
  });

  describe('test post  "/me" endpoint', () => {
    it('should return user data', async () => {
      const bearer_1 = `Bearer ${token}`;
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', bearer_1)
        .expect(200)
        .then((res) => {
          expect(res.body.login).toBe(newUser1.login);
        });
    });
  });
});
