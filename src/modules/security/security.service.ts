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

  expiredRefresh = this.configService.get<string>('EXPIRED_REFRESH');

  async getAllDevices(userId: string) {
    return this.devicesModel.aggregate([
      { $match: { userId } },
      {
        $project: {
          ip: '$ip',
          title: '$deviceName',
          lastActiveDate: '$createdAt',
          deviceId: '$_id',
          _id: 0,
        },
      },
    ]);
  }

  async deleteAllExcludeCurrent(userId: string, deviceId: string) {
    return this.devicesModel
      .deleteMany({ userId, _id: { $ne: deviceId } })
      .exec();
  }

  async deleteCurrentDevice(deviceId: string, userId: string) {
    console.log(deviceId, userId, 'device & user');

    const device = (await this.devicesModel
      .findById(deviceId)
      .exec()) as Devices;
    if (!device) {
      throw new NotFoundException(
        `${userId}---userId,  ${deviceId}----deviceId, ${device}-----deviceOb`,
      );
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
    const currentDevice = (await this.devicesModel.find({
      userId: dto.userId,
      deviceName: dto.deviceName,
    })) as Devices[];
    if (!currentDevice.length) {
      const newDevice = new this.devicesModel({
        _id: dto.deviceId,
        createdAt: new Date(),
        expiredAt: add(new Date(), {
          seconds: Number(this.expiredRefresh.slice(0, -1)),
        }),
        ip: dto.ip,
        userId: dto.userId,
        deviceName: dto.deviceName,
      });
      console.log(newDevice, 'newDevice');

      return this.devicesModel.create(newDevice);
    } else {
      this.updateDevice({ userId: dto.userId, deviceName: dto.deviceName });
    }
  }

  async updateDevice(filter: { [key: string]: string }) {
    return this.devicesModel.findOneAndUpdate(filter, {
      createdAt: new Date(),
      expiredAt: add(new Date(), {
        seconds: Number(this.expiredRefresh.slice(0, -1)),
      }),
    });
  }
}
