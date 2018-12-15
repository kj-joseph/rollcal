import { callApi } from "services/apiService";

import { IDBDerbyVenueChange, IDerbyVenueChange, IDerbyVenueChangeObject } from "interfaces/venue";

import { getGeography } from "services/geoService";
import { mapVenue } from "services/venueService";

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
			.then((changeData) => {

				resolve(mapVenueChange(changeData));

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
			.then((changeResult: IDBDerbyVenueChange[]) => {

				resolve (changeResult
					.map((changeItem) =>
						mapVenueChange(changeItem)));

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			getGeo.cancel();
		});

	});

const mapVenueChange = (
	data: IDBDerbyVenueChange,
): IDerbyVenueChange =>

	Object.assign(mapVenue(data), {
		changeId: data.change_id,
		changeObject: data.change_object ?
			JSON.parse(data.change_object)
			: undefined as IDerbyVenueChangeObject,
		submittedDuration: moment.duration(moment(data.change_submitted).diff(moment())).humanize(),
		submittedTime: moment(data.change_submitted).format("MMM D, Y h:mm a"),
		submitter: {
			id: data.change_user,
			name: data.change_user_name,
		},
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
