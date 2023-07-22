/**
 * Wrapper around `fetch` that returns the JSON body.
 * @example request('https://example.com/api/v1/users')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request<TResponse = any>(
	path: string,
	options?: RequestInit,
) {
	const response = await fetch(path, options);
	const json = await response.json();
	return json as TResponse;
}
