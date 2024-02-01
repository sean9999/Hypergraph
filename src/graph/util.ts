//	creates a [uniqueId]. A meaningful prefix, followed by a timestamp, followed by a random hex string
export const newUniqueId = (prefix: string): UniqueId => {
	const hexes = self.crypto.randomUUID().split('-');
	const segments = [
		prefix,
		performance.now(),
		hexes[3]
	];
	return segments.join("/");
}

//  a uniqueId is simply a string, so typed to imply uniqueness across it's chosen domain
export type UniqueId = string;

export type indexValue = string | number | symbol;