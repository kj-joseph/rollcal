import { callApi } from "services/apiService";

export const sendContactEmail = (
	email: string,
	message: string,
	name: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("post", "email/contact", {
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
