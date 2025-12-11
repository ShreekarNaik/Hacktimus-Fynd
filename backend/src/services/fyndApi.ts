import axios, { InternalAxiosRequestConfig } from "axios";

/**
 * Fynd API client wrapper. Uses Basic auth with Application ID and Application Token.
 * Required env when USE_FYND_API=true:
 * - FYND_API_BASE (optional; defaults to https://api.fynd.com)
 * - FYND_SEND_OTP_URL (relative or absolute)
 * - FYND_VERIFY_OTP_URL
 * - FYND_REGISTER_URL
 * - FYND_DELETE_URL
 * - FYND_APP_ID
 * - FYND_APP_TOKEN
 * Optional:
 * - FYND_PLATFORM_ID (sent as `platform` query param)
 * - FYND_DEFAULT_COUNTRY_CODE (defaults to 91)
 */
const base = process.env.FYND_API_BASE || "https://api.fynd.com";

const client = axios.create({
  baseURL: base || undefined,
  timeout: 15000,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const appId = process.env.FYND_APP_ID;
  const appToken = process.env.FYND_APP_TOKEN;
  const basic =
    appId && appToken
      ? Buffer.from(`${appId}:${appToken}`).toString("base64")
      : undefined;

  if (!basic) {
    throw new Error("FYND_APP_ID or FYND_APP_TOKEN missing for Fynd API call");
  }

  const headers = {
    ...(config.headers || {}),
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/json",
  } as any;
  (config as any).headers = headers;
  return config as any;
});

const platformParam = process.env.FYND_PLATFORM_ID;
const defaultCountry = process.env.FYND_DEFAULT_COUNTRY_CODE || "91";

export async function sendOtp(
  mobile: string,
  countryCode: string = defaultCountry,
  action: "send" | "resend" = "send",
  resendToken?: string
) {
  const url = process.env.FYND_SEND_OTP_URL;
  if (!url) throw new Error("FYND_SEND_OTP_URL not configured");

  console.log(`[fyndApi] Sending OTP to ${mobile} (${countryCode}) via ${url}`);

  const res = await client.post(
    url,
    {
      mobile,
      country_code: countryCode,
      action,
      ...(resendToken ? { token: resendToken } : {}),
    },
    {
      params: platformParam ? { platform: platformParam } : undefined,
    }
  );

  console.log(`[fyndApi] OTP response:`, res.data);
  return res.data;
}

export async function verifyOtp(otp: string, requestId: string) {
  const url = process.env.FYND_VERIFY_OTP_URL;
  if (!url) throw new Error("FYND_VERIFY_OTP_URL not configured");

  const res = await client.post(
    url,
    {
      otp,
      request_id: requestId,
    },
    {
      params: platformParam ? { platform: platformParam } : undefined,
    }
  );

  return res.data;
}

export async function registerUser(payload: Record<string, any>) {
  const url = process.env.FYND_REGISTER_URL;
  if (!url) throw new Error("FYND_REGISTER_URL not configured");
  const res = await client.post(url, payload, {
    params: platformParam ? { platform: platformParam } : undefined,
  });
  return res.data;
}

export async function deleteUser(payload: Record<string, any>) {
  const url = process.env.FYND_DELETE_URL;
  if (!url) throw new Error("FYND_DELETE_URL not configured");
  const res = await client.post(url, payload, {
    params: platformParam ? { platform: platformParam } : undefined,
  });
  return res.data;
}
