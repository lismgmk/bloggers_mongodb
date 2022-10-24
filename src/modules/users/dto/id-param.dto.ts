import { ForUnExistsIdUserError } from 'dto-validator/if-not-found-user-id-drop-error';
import { IsMongoIdObject } from 'dto-validator/is-mongid-obj';

export class IdParamDTO {
  @IsMongoIdObject()
  @ForUnExistsIdUserError()
  id: string;
}
