export interface AuthSigninRequest {
  email: string;
  password: string;
}

export interface AuthSigninResponse {
  access_token: string;
}
