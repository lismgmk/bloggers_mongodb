import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';

class FakerConnectDb {
  private mongod: MongoMemoryServer | undefined = undefined;

  async connect() {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    process.env.DB_CONN_MONGOOSE_STRING = uri;
    const mongooseOpts = {
      maxPoolSize: 50,
      wtimeoutMS: 2500,
      useNewUrlParser: true,
    } as ConnectOptions;

    await mongoose.connect(uri, mongooseOpts);
  }
  async closeDatabase() {
    if (this.mongod) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await this.mongod.stop();
    }
  }

  async clearDatabase() {
    if (this.mongod) {
      const collections = mongoose.connection.collections;

      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  }
}

export const fakerConnectDb = new FakerConnectDb();
