import { Test, TestingModule } from '@nestjs/testing';
import { TestingController } from './testing.controller';

describe('TestingController', () => {
  let controller: TestingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestingController],
    }).compile();

    controller = module.get<TestingController>(TestingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
