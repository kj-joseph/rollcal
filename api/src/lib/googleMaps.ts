import { IAddressObject } from "interfaces";

const mapsClient = require("@google/maps").createClient({
	Promise,
	key: process.env.GOOGLE_KEY_DEV || process.env.GOOGLE_KEY_PROD,
});

export const getGeocode = (addressObject: IAddressObject) => {

	if (mapsClient) {

		const address = `${addressObject.address1}, ${addressObject.city}${
			addressObject.region ? `, ${addressObject.region}` : ""
		}${
			addressObject.postcode ? ` ${addressObject.postcode}` : ""
		}, ${addressObject.country}`;

		return mapsClient.geocode({
			address,
		}).asPromise()
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
