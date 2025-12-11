const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const store: Record<string, OtpEntry> = {};

export function generateOtp(identifier: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store[identifier] = {
    code,
    expiresAt: Date.now() + EXPIRY_MS,
  };
  return code;
}

export function verifyOtp(identifier: string, otp: string): boolean {
  const entry = store[identifier];
  if (!entry) return false;
  const isExpired = Date.now() > entry.expiresAt;
  const isMatch = entry.code === otp;
  if (!isExpired && isMatch) {
    delete store[identifier];
    return true;
  }
  if (isExpired) {
    delete store[identifier];
  }
  return false;
}
