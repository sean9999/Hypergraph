//	creates a namespaced unique string that likes a little like a UUID
const newUniqueId = (prefix: string): uniqueId => {
	const hexes = self.crypto.randomUUID().split('-');
	const segments = [
		prefix,
		performance.now(),
		hexes[3]
	];
	return segments.join("/");
}

//  a uniqueId is simply a string. Included here for literacy.
export type uniqueId = string;
export {newUniqueId}
