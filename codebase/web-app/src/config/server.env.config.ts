const ntfyServerDomain = process.env.NTFY_SERVER_DOMAIN || 'ntfy.sh';
const ntfyChannelName = process.env.NTFY_CHANNEL_NAME || '';
const ntfyUsername = process.env.NTFY_USERNAME || '';
const ntfyPassword = process.env.NTFY_PASSWORD || '';
const smtpPort = Number(process.env.SMTP_PORT || 587);

const authHeader =
  ntfyUsername && ntfyPassword
    ? `Basic ${Buffer.from(`${ntfyUsername}:${ntfyPassword}`).toString('base64')}`
    : undefined;

const serverEnvConfig = {
  APP_BASE_URL:
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000',
  AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'weather-man-local-development-secret',
  AUTH_SIGNUP_ENABLED: process.env.AUTH_SIGNUP_ENABLED !== 'false',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  NTFY_SERVER_DOMAIN: ntfyServerDomain,
  NTFY_CHANNEL_NAME: ntfyChannelName,
  NTFY_AUTH_HEADER: authHeader,
  NTFY_URL: ntfyChannelName
    ? `https://${ntfyServerDomain}/${ntfyChannelName}`
    : undefined,
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number.isFinite(smtpPort) ? smtpPort : 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};

export default serverEnvConfig;
