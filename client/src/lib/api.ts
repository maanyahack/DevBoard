// Base URL for API requests. Reads from VITE_API_URL env or defaults to http://localhost:4000
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

// this function checks if the token is valid
export function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;
}

// this function checks if the response is an error response
function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

// this function gets the error message from the response
async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

// this function is used to make api requests to the backend
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
