import { callApi } from "services/apiService";
// import actions from "redux/actions";
// import store from "redux/store";

import { IDBDerbyEvent } from "interfaces/event";
// import { IGeoCountry, IGeoRegion, ITimeZone } from "interfaces/geo";
// import { IUserInfo } from "interfaces/user";
import { IDBDerbyVenue, IDerbyVenue } from "interfaces/venue";

import { mapCountry, mapRegion } from "services/geoService";
import { mapTimezone } from "services/timeService";
import { mapUser } from "services/userService";

export const loadVenues = (
	userId?: number,
): Promise<IDerbyVenue[]> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"venues/getVenues",
			{
				user: userId || undefined,
			},
		);

		onCancel(() => {
			apiCall.cancel();
		});

		apiCall
			.then((venueData: IDBDerbyVenue[]) => {

				resolve(venueData
					.map((venue) => mapVenue(venue)));

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const mapVenue = (data: IDBDerbyEvent | IDBDerbyVenue): IDerbyVenue => ({
	address1: data.venue_address1,
	address2: data.venue_address2,
	city: data.venue_city,
	country: mapCountry(data),
	description: data.venue_description,
	distance: data.venue_distance,
	id: data.venue_id,
	link: data.venue_link,
	name: data.venue_name,
	postcode: data.venue_postcode,
	region: mapRegion(data),
	timezone: mapTimezone(data),
	user: mapUser(data),
});
