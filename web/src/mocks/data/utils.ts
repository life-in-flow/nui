
/** restituisce un uuid */
export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** restituisce il timestamp string della data di oggi */
export function getNow(): string {
	return new Date().toISOString()
}

/** restituisce un numero random compreso tra "min" e "max" */
export function randomInt(max: number = 100, min: number = 0): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomName(length?: number): string {
	if (length == null) length = randomInt(12, 3)
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export function randomDate() {
	return new Date(Math.floor(Math.random() * 1000000000000))
}