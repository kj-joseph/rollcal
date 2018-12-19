import { callApi } from "services/apiService";

import { IDerbyVenue } from "interfaces/venue";

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
			`venue/${id}`,
		);

		onCancel(() => {
			apiCall.cancel();
		});

		apiCall
			.then((response) => {

				const venueData: IDerbyVenue = response.data;
				resolve(venueData);

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
			"venues",
			{
				user: userId || undefined,
			},
		);

		apiCall
			.then((response) => {

				const venueList: IDerbyVenue[] = response.data;
				resolve(venueList);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});
