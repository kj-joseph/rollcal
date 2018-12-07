import { callApi } from "services/apiService";

export const sendContactEmail = (
	email: string,
	message: string,
	name: string,
): Promise<any> => {

	return new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("post", "contact/sendContactForm", {
			email,
			message,
			name,
		})
		.then(() => {

			resolve();

		})
		.catch((error) => {

			reject(error);

		});

		onCancel(() => {
			apiCall.cancel();
		});

	});

};
