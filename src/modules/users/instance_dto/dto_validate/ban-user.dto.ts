import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBoolean, Length } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { ForUnExistsIdUserError } from '../../../../dto-validator/if-not-found-user-id-drop-error';
import { IsMongoIdObject } from '../../../../dto-validator/is-mongid-obj';
import { BanUserMain } from '../main_instance/ban-user.instance';

export class BanUserDto implements BanUserMain {
  @IsBoolean()
  @Type(() => Boolean)
  readonly isBanned: boolean;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 100, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly banReason: string;
}
export class BanBlogDto extends BanUserDto {
  @IsMongoIdObject()
  readonly blogId: string;
}
