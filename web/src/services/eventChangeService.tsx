import { callApi } from "services/apiService";

import { IDBDerbyEventChange, IDerbyEventChange, IDerbyEventChangeObject } from "interfaces/event";

import { mapEvent } from "services/eventService";
import { getGeography } from "services/geoService";

import moment from "moment";

export const approveEventChange = (
	id: number,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			`events/approveChange/${id}`,
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
			`events/getChange/${id}`,
		)
			.then((changeData) => {

				resolve(mapEventChange(changeData));

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
					"events/getChangeList",
				))

			.then((changeResult: IDBDerbyEventChange[]) => {

				const changes: Array<Promise<IDerbyEventChange>> = [];

				for (const changeItem of changeResult) {

					changes.push(mapEventChange(changeItem, false));

				}

				return changes;

			})
			.then((changes) =>

				Promise.all(changes))

			.then((changeList) => {

				resolve(changeList);

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

const mapEventChange = (
	data: IDBDerbyEventChange,
	includeFeatures = true,
): Promise<IDerbyEventChange> =>

	new Promise((resolve, reject, onCancel) => {

		const eventMapping =
			mapEvent(data, includeFeatures)
				.then((event) => {

					resolve(Object.assign(event, {
						changeId: data.change_id,
						changeObject: data.change_object ?
							JSON.parse(data.change_object)
							: undefined as IDerbyEventChangeObject,
						submittedDuration: moment.duration(moment(data.change_submitted).diff(moment())).humanize(),
						submittedTime: moment(data.change_submitted).format("MMM D, Y h:mm a"),
						submitter: {
							userId: data.change_user,
							userName: data.change_user_name,
						},
					}));

				})
				.catch((error) => {

					reject(error);

				});

		onCancel(() => {
			eventMapping.cancel();
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
			"post",
			`events/rejectChange/${id}`,
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
			"put",
			"events/saveChanges",
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
