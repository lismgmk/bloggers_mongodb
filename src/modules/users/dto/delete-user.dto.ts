import { IsMongoIdObject } from '../../../dto-validator/is-mongid-obj';
import { ForUnExistsIdUserError } from '../../../dto-validator/if-not-found-dy-id-drop-error';

export class ParamDTO {
  @IsMongoIdObject()
  @ForUnExistsIdUserError()
  id: string;
}
