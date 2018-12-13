import { callApi } from "services/apiService";

import { IDBDerbyEvent } from "interfaces/event";
import { IDBDerbyVenue, IDerbyVenue } from "interfaces/venue";

import { mapCountry, mapRegion } from "services/geoService";
import { mapTimezone } from "services/timeService";
import { mapUser } from "services/userService";

export const buildLocation = (
	address: {
		address1?: string,
		city: string,
		country: string,
		postcode?: string,
		region?: string,
	},
): string =>

	`${address.address1 ?
		`${address.address1}, `
	: ""}${address.city}${address.region ?
		`, ${address.region}`
	: ""}${address.postcode ?
		` ${address.postcode}`
	: ""}, ${address.country}`;

export const buildVenueLocation = (
	venue: IDerbyVenue,
	format: "long" | "short" = "short",
	includeStreet = false,
	): string =>

		buildLocation({
			address1: includeStreet ?
				venue.address1
				: undefined,
			city: venue.city,
			country: format === "long" ?
				venue.country.name
				: venue.country.code,
			region: venue.region && venue.region.abbreviation ?
				format === "long" ?
					venue.region.name
					: venue.region.abbreviation
				: undefined,
		});


export const getVenueDetails = (
	id: number,
): Promise<IDerbyVenue> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			`venues/getVenueDetails/${id}`,
		);

		onCancel(() => {
			apiCall.cancel();
		});

		apiCall
			.then((venueData: IDBDerbyVenue) => {

				resolve(mapVenue(venueData));

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

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

export const mapVenue = (
	data: IDBDerbyEvent | IDBDerbyVenue,
): IDerbyVenue => ({
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
