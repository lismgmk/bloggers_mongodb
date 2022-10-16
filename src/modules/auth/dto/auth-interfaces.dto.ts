export interface IRegistrationDto {
  login: string;
  password: string;
  email: string;
  userIp: string;
}
export interface IRegistrationConfirmationResponse {
  login: string;
  createdAt: string;
  email: string;
  id: string;
}
