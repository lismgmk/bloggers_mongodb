import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { Devices } from '../../schemas/device.schema';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(Devices.name) private devicesModel: Model<Devices>,
    private configService: ConfigService,
  ) {}

  async getAllDevices(userId: string) {
    return this.devicesModel.find({ userId }).exec();
  }

  async deleteAllExcludeCurrent(userId: string, deviceId: string) {
    return this.devicesModel
      .deleteMany({ userId, deviceId: { $ne: deviceId } })
      .exec();
  }

  async deleteCurrentDevice(deviceId: string, userId: string) {
    const device = (await this.devicesModel
      .findById(deviceId)
      .exec()) as Devices;
    if (!device) {
      throw new NotFoundException();
    }
    if (!device.userId.equals(userId)) {
      throw new ForbiddenException();
    }
    return this.devicesModel.findByIdAndDelete(deviceId).exec();
  }

  async createDevice(dto: {
    ip: string;
    userId: string;
    deviceName: string;
    deviceId: Types.ObjectId;
  }) {
    const expiredRefresh = this.configService.get<string>('EXPIRED_REFRESH');

    const currentDevice = await this.devicesModel.find({
      deviceName: dto.deviceName,
    });
    if (!currentDevice.length) {
      const newDevice = new this.devicesModel({
        _id: dto.deviceId,
        createdAt: new Date(),
        expiredAt: add(new Date(), {
          seconds: Number(expiredRefresh.slice(0, -1)),
        }),
        ip: dto.ip,
        userId: dto.userId,
        deviceName: dto.deviceName,
      });

      return this.devicesModel.create(newDevice);
    }
  }
}
