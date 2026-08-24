import serverEnvConfig from '@/config/server.env.config';

type NotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

export async function sendSensorAlert(
  title: string,
  message: string
): Promise<NotificationResult> {
  if (!serverEnvConfig.NTFY_URL) {
    return { status: 'skipped', reason: 'NTFY_CHANNEL_NAME is not configured' };
  }

  const headers = new Headers({
    'Content-Type': 'text/plain',
    Title: title,
    Priority: 'urgent',
    Tags: 'warning',
  });

  if (serverEnvConfig.NTFY_AUTH_HEADER) {
    headers.set('Authorization', serverEnvConfig.NTFY_AUTH_HEADER);
  }

  try {
    const response = await fetch(serverEnvConfig.NTFY_URL, {
      method: 'POST',
      body: message,
      headers,
    });

    if (!response.ok) {
      return {
        status: 'failed',
        reason: `ntfy responded with ${response.status}`,
      };
    }

    return { status: 'sent' };
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
