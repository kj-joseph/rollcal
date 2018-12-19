export const dbArray = (
	data: any,
): any =>
	mapResponse(data, false);

export const dbObject = (
	data: any,
): any =>
	mapResponse(data, true);

const mapResponse = (
	data: any,
	single = false,
): any => {

	const mapped = data
		.map((row: {}) => ({
			...row,
		}));

	if (single) {

		return mapped[0];

	} else {

		return mapped;

	}

};
