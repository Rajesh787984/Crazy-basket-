
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  isVerified: boolean;
  walletBalance: number;
  isBlacklisted: boolean;
  userType: 'B2C' | 'B2B';
  ipAddress: string;
  deviceId: string;
  referralCode?: string;
  referredBy?: string;
  photoUrl?: string;
}