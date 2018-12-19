import { callApi } from "services/apiService";

import { IDBDerbyVenueChange, IDerbyVenueChange, IDerbyVenueChangeObject } from "interfaces/venue";

import { getGeography } from "services/geoService";

import moment from "moment";

export const approveVenueChange = (
	id: number,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			`venue-change/${id}/approval`,
		)
			.then(() =>
				resolve())

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getVenueChange = (
	id: number,
): Promise<IDerbyVenueChange> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			`venue-change/${id}`,
		)
			.then((response) => {

				const venueChange: IDerbyVenueChange = response.data;

				resolve(venueChange);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getVenueChangeList = ()
	: Promise<IDerbyVenueChange[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getGeo = Promise.all([
			getGeography(),
		])
			.then(() => {

				const apiCall = callApi(
					"get",
					"venue-changes",
				);

				onCancel(() => {
					apiCall.cancel();
				});

				return apiCall;

			})
			.then((response) => {

				const changeList: IDerbyVenueChange[] = response.data;

				resolve(changeList);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			getGeo.cancel();
		});

	});

export const rejectVenueChange = (
	id: number,
	comment: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			`venue-change/${id}/rejection`,
			{
				comment,
			},
		)
			.then(() =>
				resolve())

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const saveVenueChange = (
	changes: IDerbyVenueChangeObject,
	id: number = 0,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"venue-change",
			{
				changeObject: JSON.stringify(changes),
				id,
			},
		);

		apiCall
			.then(() => {

				resolve();

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});
