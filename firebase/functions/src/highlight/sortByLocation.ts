export default function sortByLocation(a: Highlight, b: Highlight) {
	let locationA: number | string = String(a.location);
	let locationB: number | string = String(b.location);

	// If the property is an int or range, let's compare the number value rather than string.
	// Kindle clippings sometimes export a range (ie. "1234-1456")
	if (String(parseInt(locationA)) === locationA || locationA.match(/\d+-\d+/)) {
		locationA = parseInt(locationA);
		locationB = parseInt(locationB);
	}

	if (locationA < locationB) return -1;
	if (locationA > locationB) return 1;
	return 0;
}
