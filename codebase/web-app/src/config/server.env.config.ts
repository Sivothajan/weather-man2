const ntfyServerDomain = process.env.NTFY_SERVER_DOMAIN || 'ntfy.sh';
const ntfyChannelName = process.env.NTFY_CHANNEL_NAME || '';
const ntfyUsername = process.env.NTFY_USERNAME || '';
const ntfyPassword = process.env.NTFY_PASSWORD || '';

const authHeader =
  ntfyUsername && ntfyPassword
    ? `Basic ${Buffer.from(`${ntfyUsername}:${ntfyPassword}`).toString('base64')}`
    : undefined;

const serverEnvConfig = {
  NTFY_SERVER_DOMAIN: ntfyServerDomain,
  NTFY_CHANNEL_NAME: ntfyChannelName,
  NTFY_AUTH_HEADER: authHeader,
  NTFY_URL: ntfyChannelName
    ? `https://${ntfyServerDomain}/${ntfyChannelName}`
    : undefined,
};

export default serverEnvConfig;
