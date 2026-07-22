const apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');

export function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;
}

function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
