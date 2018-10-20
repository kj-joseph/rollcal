import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export const sendValidationEmail = (email: string, username: string, validationCode: string): Promise<boolean> => {

	return axios.post("https://api.emailjs.com/api/v1.0/email/send", {
		service_id: "server",
		template_id: "account_validation",
		template_params: {
			email,
			emailEncoded: encodeURIComponent(email.replace(/\./g, "%2E")),
			username,
			usernameEncoded: encodeURIComponent(username.replace(/\./g, "%2E")),
 			validationCode,
		},
		user_id: "user_hX0Eb4e3DRLA6dAAUMHKu",

	}).then((response: any) => {

		return true;

	}).catch((error: any) => {

		console.error(error);
		return false;

	});

};

export const sendEmailChangeEmail = (email: string, username: string, validationCode: string): Promise<boolean> => {

	return axios.post("https://api.emailjs.com/api/v1.0/email/send", {
		service_id: "server",
		template_id: "email_change",
		template_params: {
			email,
			emailEncoded: encodeURIComponent(email.replace(/\./g, "%2E")),
			username,
			usernameEncoded: encodeURIComponent(username.replace(/\./g, "%2E")),
 			validationCode,
		},
		user_id: "user_hX0Eb4e3DRLA6dAAUMHKu",

	}).then((response: any) => {

		return true;

	}).catch((error: any) => {

		console.error(error);
		return false;

	});

};
