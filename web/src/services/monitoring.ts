/**
 * Track a custom event
 * @example trackEvent('clicked-button', { application_id: '123' })
 */
export function trackEvent(eventName: string, attributes = {}) {
	// https://developers.google.com/tag-platform/gtagjs/reference#event
	if (typeof globalThis.gtag === "function") {
		globalThis.gtag("event", eventName, attributes);
	}
}
