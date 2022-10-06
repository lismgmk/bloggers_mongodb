import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { disconnect } from 'mongoose';
import { fakerConnectDb } from '../../test-params/fake-connect-db';
import { AppModule } from '../app.module';
import { newUserModel } from './test-consts/test-user-values';
import { User } from './users.schema';

describe('test user-schema validation', () => {
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

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });
  afterAll(() => {
    disconnect();
  });
  describe('test email field validation in schema', () => {
    it('should return error when no email in params', async () => {
      const userParams = newUserModel;
      delete userParams.accountData.email;
      const userInstance = new User(userParams);
      return userInstance.save().then((res) => {
        console.log(res);
      });
    });
  });
});
