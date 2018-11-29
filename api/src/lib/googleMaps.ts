const mapsClient = require("@google/maps").createClient({
	Promise,
	key: process.env.GOOGLE_KEY_DEV || process.env.GOOGLE_KEY_PROD,
});

export const getGeocode = (address: string, country?: string) => {

	if (mapsClient) {

		const geoCodeObject: {
			address: string,
			country?: string,
		} = {
			address,
		};

		if (country && country.length === 2) {
			geoCodeObject.country = country;
		}

		return mapsClient.geocode(geoCodeObject).asPromise()
			.then((response: any) => {

				if (response.json.results[0]
					&& response.json.results[0].geometry
					&& response.json.results[0].geometry.location) {

					return response.json.results[0].geometry.location;

				} else {

					return null;

				}


			})
			.catch((error: Error): null => {
				console.error(error);

				return null;

			});

	} else {

		return null;

	}

};
