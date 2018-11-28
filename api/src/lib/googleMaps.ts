import { IVenueAddress } from "interfaces";

const mapsClient = require("@google/maps").createClient({
	Promise,
	key: process.env.GOOGLE_KEY_DEV || process.env.GOOGLE_KEY_PROD,
});

export const getGeocode = (addressObject: IVenueAddress) => {

	if (mapsClient) {

		const address = `${addressObject.venue_address1}${
			addressObject.venue_address2 ? `, ${addressObject.venue_address2}` : ""
		}, ${addressObject.venue_city}${
			addressObject.region_abbreviation ? `, ${addressObject.region_abbreviation}` : ""
		}${
			addressObject.venue_postcode ? ` ${addressObject.venue_postcode}, ${addressObject.country_name}` : ""}`;

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
