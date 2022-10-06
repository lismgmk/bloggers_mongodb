import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { disconnect } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { fakerConnectDb } from '../src/test-params/fake-connect-db';
import {
  newUser1,
  invalidUser,
  adminToken,
} from '../src/test-params/test-values';

describe('test user-router "/users"', () => {
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
    console.log(process.env.DB_CONN_MONGOOSE_STRING, 'nomgoose string');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });
  afterAll(() => {
    disconnect();
  });
  describe('test post  "/" endpoint', () => {
    it('should create new user with confirm field true', () => {
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: newUser1.email,
      };
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(201)
        .then((res) => {
          console.log(res.body);
        });
    });
    it('should check unique user login', async () => {
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: newUser1.email,
      };
      const agent = request(app.getHttpServer());
      await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(201);

      const res = await agent
        .post('/users')
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(400);
      console.log(res.body, 'resss');
    });

    it('should return error 400 for wrong fields', () => {
      const bodyParams = {
        login: invalidUser.login,
        password: invalidUser.password,
        email: invalidUser.email,
      };
      return request(app.getHttpServer())
        .post('/users')
        .send(bodyParams)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .expect(400)
        .then((res) => {
          console.log(res.body);
        });
    });

    it('should return error 401 fot unauthorized user', () => {
      const bodyParams = {
        login: newUser1.login,
        password: newUser1.password,
        email: newUser1.email,
      };
      return request(app.getHttpServer())
        .post('/users')
        .send(bodyParams)
        .expect(401)
        .then((res) => {
          console.log(res.body);
        });
    });
  });
});
