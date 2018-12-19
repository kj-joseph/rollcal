import { callApi } from "services/apiService";

import { IDerbyEventChange, IDerbyEventChangeObject } from "interfaces/event";

import { getGeography } from "services/geoService";

export const approveEventChange = (
	id: number,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			`event-change/${id}/approval`,
		)
			.then(() =>
				resolve())

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getEventChange = (
	id: number,
): Promise<IDerbyEventChange> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			`event-change/${id}`,
		)
			.then((response) => {

				const changeData: IDerbyEventChange = response.data;
				resolve(changeData);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getEventChangeList = ()
	: Promise<IDerbyEventChange[]> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = Promise.all([
			getGeography(),
		])
			.then(() =>

				callApi(
					"get",
					"event-changes",
				))

			.then((response) => {

				const changeList: IDerbyEventChange[] = response.data;
				resolve(changeList);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const mapChangeData = (
	data: Array<{
		field: string,
		value: any,
	}>,
): {
	[key: string]: any,
} => {

	const output: {
		[key: string]: any,
	} = {};

	for (const dataField of data) {

		output[dataField.field] = dataField.value;

	}

	return output;

};

export const rejectEventChange = (
	id: number,
	comment: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			`event-change/${id}/rejection`,
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

export const saveEventChange = (
	changes: IDerbyEventChangeObject,
	id: number = 0,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"event-change",
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
