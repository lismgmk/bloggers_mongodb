import { createParamDecorator, SetMetadata } from '@nestjs/common';

export enum TokenType {
  Access = 'accessToken',
  Refresh = 'refreshToken',
}

export const TOKEN_KEY = 'token';
export const Token = createParamDecorator((tokenType: TokenType[]) => {
  return SetMetadata(TOKEN_KEY, tokenType);
});
