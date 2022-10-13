import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { UsersRepository } from '../src/modules/users/users.repository';
import { User } from '../src/schemas/users.schema';
import { JwtPassService } from '../src/services/jwt-pass.service';
import { fakerConnectDb } from '../src/test-params/fake-connect-db';
import { newUser1, adminToken } from '../src/test-params/test-values';

describe('test user-router "/auth"', () => {
  let userRepo: UsersRepository;
  let jwtPassService: JwtPassService;
  let app;
  // let configService;
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

    // configService = moduleFixture.get<ConfigService>(ConfigService);

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });
  afterAll(() => {
    disconnect();
  });

  describe('test post  "/registration" endpoint', () => {
    it('should go to guard', () => {
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: 'lismgmk2@gmail.com',
      };
      return (
        request(app.getHttpServer())
          .post('/auth/registration')
          .send(bodyParams)
          // .expect(204)
          .then((res) => {
            console.log(res.body);
          })
      );
    });
    it('should check ip middleware and return error 429 if increase attempt ip request limit ', async () => {
      process.env.ATTEMPTS_LIMIT = '2';
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: newUser1.email,
      };
      const agent = request(app.getHttpServer());
      await agent.post('/auth/registration').send(bodyParams).expect(201);
      await agent.post('/auth/registration').send(bodyParams).expect(201);
      await agent
        .post('/auth/registration')
        .send(bodyParams)
        .expect(429)
        .then((res) => {
          console.log(res.body);
        });
    });
  });

  describe('test post  "/refresh-token" endpoint', () => {
    const bodyParams = {
      login: newUser1.login,
      password: newUser1.password,
      email: newUser1.email,
    };
    let token: string;
    let newUser: User;
    beforeEach(async () => {
      const agent = request(app.getHttpServer());
      await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams);
      newUser = (await userRepo.getUserByEmail(newUser1.email)) as User;
      token = await jwtPassService.createJwt(
        newUser._id,
        process.env.EXPIRED_REFRESH,
        // configService.get<string>('EXPIRED_REFRESH'),
      );
    });

    it('should return new refresh token in headers and access token in body', async () => {
      const cookie = `refreshToken=${token}; Path=/; Secure; HttpOnly;`;
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', cookie);
      // .expect(200);
      // .then(async (res) => {
      //   expect(typeof res.body.accessToken).toBe('string');
      //   expect(typeof res.headers['set-cookie'][0]).toBe('string');
      // });
    });

    it('should return error when send 2 times the same refresh token', async () => {
      const cookie = `refreshToken=${token}; Path=/; Secure; HttpOnly;`;
      const agent = request(app.getHttpServer());
      await agent.post('/auth/refresh-token').set('Cookie', cookie);

      return (
        request(app.getHttpServer())
          .post('/auth/refresh-token')
          .set('Cookie', cookie)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    });

    it('should check bearer access', async () => {
      const bearer_1 = `Bearer ${token}`;
      return (
        request(app.getHttpServer())
          .post('/auth/refresh-token')
          .set('Authorization', bearer_1)
          .send(bodyParams)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    });
  });

  describe('test post  "/login" endpoint', () => {
    const bodyParams = {
      login: newUser1.login,
      password: newUser1.password,
      email: newUser1.email,
    };
    let token: string;
    let newUser: User;
    beforeEach(async () => {
      const agent = request(app.getHttpServer());
      await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams);
      newUser = (await userRepo.getUserByEmail(newUser1.email)) as User;
      token = await jwtPassService.createJwt(
        newUser._id,
        process.env.EXPIRED_REFRESH,
        // configService.get<string>('EXPIRED_REFRESH'),
      );
    });

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
    const bodyParams = {
      login: newUser1.login,
      password: newUser1.password,
      email: newUser1.email,
    };
    let token: string;
    let newUser: User;
    beforeEach(async () => {
      const agent = request(app.getHttpServer());
      await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams);
      newUser = (await userRepo.getUserByEmail(newUser1.email)) as User;
      token = await jwtPassService.createJwt(
        newUser._id,
        process.env.EXPIRED_REFRESH,
        // configService.get<string>('EXPIRED_REFRESH'),
      );
    });

    it('should resend email and change confirmation code', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({ email: newUser1.email })
        .expect(204)
        .then(async (res) => {
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
});
