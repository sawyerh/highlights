/**
 * Wrapper around `fetch` that returns the JSON body.
 * @example request('https://example.com/api/v1/users')
 */
export async function request<TResponse = unknown>(
	path: string,
	options?: RequestInit,
) {
	const response = await fetch(path, options);
	const json = await response.json();
	return json as TResponse;
}
