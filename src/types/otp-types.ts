export interface IOtp {
  name: string;
  email: string;
  password: string;
  otp: number;
  expiresAt: Date;
}
