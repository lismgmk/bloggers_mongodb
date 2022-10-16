import { IsMongoIdObject } from '../../../dto-validator/is-mongid-obj';
import { UserUnExists } from '../../../dto-validator/is-unexist-user';

export class ParamDTO {
  @IsMongoIdObject()
  @UserUnExists()
  id: string;
}
