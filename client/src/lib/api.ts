// Base URL for all API requests to the Express backend.
// Reads from the VITE_API_URL environment variable, or defaults to localhost:4000.
// '.replace(/\/$/, '')' removes any trailing slash to prevent double-slash URLs.
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

/**
 * requireToken — validates that an access token exists before making API calls.
 * Throws an error if no token is provided, preventing unauthenticated requests.
 *
 * Usage: const token = requireToken(session?.access_token);
 */
export function requireToken(token: string | undefined): string {
  if (!token) throw new Error('Authentication required.');
  return token;  // TypeScript now knows this is a string (not undefined)
}

/**
 * isErrorResponse — type guard that checks if an unknown value has a 'message' property.
 * TypeScript uses this to narrow the type — after this check, the value is
 * guaranteed to have a string 'message' property.
 *
 * 'value is { message: string }' is a TypeScript "type predicate" — it tells
 * TypeScript that if this function returns true, the value has that shape.
 */
function isErrorResponse(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string';
}

/**
 * getErrorMessage — extracts a human-readable error message from an API response.
 * Tries to parse the JSON body for a 'message' field; falls back to the status code.
 */
async function getErrorMessage(response: Response): Promise<string> {
  // '.catch(() => null)' — if JSON parsing fails (e.g., HTML error page), return null.
  const body: unknown = await response.json().catch(() => null);
  return isErrorResponse(body) ? body.message : `Request failed with status ${response.status}`;
}

/**
 * apiRequest — the central function for making authenticated API calls.
 *
 * All client-side API calls go through this function. It:
 * 1. Prepends the base URL to the path
 * 2. Adds the Authorization header with the user's JWT
 * 3. Sets Content-Type to JSON
 * 4. Handles errors by throwing with the server's error message
 * 5. Returns the typed response
 *
 * @typeParam T — the TypeScript type of the expected response. This makes
 * the function generic — you can use it with any response shape:
 *   apiRequest<{ notes: Note[] }>('/api/notes', token)
 *   apiRequest<{ task: Task }>('/api/tasks', token, { method: 'POST', body: ... })
 */
export async function apiRequest<T>(
  path: string,        // API endpoint path (e.g., '/api/notes')
  accessToken: string, // The user's JWT for authentication
  options: RequestInit = {},  // Additional fetch options (method, body, etc.)
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,  // Spread any additional options (method, body, etc.)
    headers: {
      'Content-Type': 'application/json',           // Tell the server we're sending JSON
      Authorization: `Bearer ${accessToken}`,       // Attach the JWT token
      ...options.headers,  // Allow overriding headers if needed
    },
  });

  // If the server returned an error status (4xx or 5xx), extract the error
  // message and throw it — React Query will catch this and show an error state.
  if (!response.ok) throw new Error(await getErrorMessage(response));

  // 204 No Content (e.g., DELETE responses) — return undefined cast to T.
  // There's no body to parse, so we skip the JSON step.
  if (response.status === 204) return undefined as T;

  // Parse the JSON response and cast it to the expected type T.
  // The 'as T' cast tells TypeScript to trust our generic type parameter.
  return (await response.json()) as T;
}
