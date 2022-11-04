import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CodeAuthDto {
  @IsDate({ message: 'not Date' })
  @Type(() => Date)
  readonly code: Date;
}
