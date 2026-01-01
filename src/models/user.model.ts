
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  insiderPoints: number;
  isVerified: boolean;
}
