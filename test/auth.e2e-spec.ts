import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { UsersRepository } from '../src/modules/users/users.repository';
import { fakerConnectDb } from '../src/test-params/fake-connect-db';
import { newUser1, adminToken } from '../src/test-params/test-values';

describe('test user-router "/auth"', () => {
  let app: INestApplication;
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
    const userRepo = moduleFixture.get<UsersRepository>(UsersRepository);
    // const expiredRefresh = moduleFixture.get<string>('EXPIRED_REFRESH');
    app = moduleFixture.createNestApplication();
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
        email: newUser1.email,
      };
      return (
        request(app.getHttpServer())
          .post('/auth/registration')
          .send(bodyParams)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    });
  });
  describe('test post  "/refresh-token" endpoint', () => {
    // const refreshToken = jwtPassService.createJwt(
    //   new ObjectId(newUser1.id),
    //   expiredRefresh,
    // );
    const cookie = `refreshToken=Token; Path=/; Secure; HttpOnly;`;

    it('should get cookie', async () => {
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: newUser1.email,
      };
      const agent = request(app.getHttpServer());
      await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams);

      return (
        request(app.getHttpServer())
          .post('/auth/refresh-token')
          .set('Cookie', cookie)
          .send(bodyParams)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    });
  });
});
