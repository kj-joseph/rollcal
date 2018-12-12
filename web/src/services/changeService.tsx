import { callApi } from "services/apiService";

import { IDerbyEventChangeObject } from "interfaces/event";


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
