import store from "redux/store";

import axios, { AxiosRequestConfig } from "axios";

export const callApi = (
	method: "delete" | "get" | "post" | "put",
	path: string,
	params: {
		[key: string]: any,
	} = {},
)
: Promise<any> =>

	new Promise((resolve, reject, onCancel) => {

		const axiosSignal = axios.CancelToken.source();
		const state = store.getState();

		// remove empty parameters
		for (const param in params) {
			if (params.hasOwnProperty(param)) {
				if (!params[param]) {
					delete params[param];
				}
			}
		}

		const axiosRequest: AxiosRequestConfig = {
			cancelToken: axiosSignal.token,
			method,
			url: `${state.apiLocation}${path}`,
			withCredentials: true,
		};

		if (method === "get") {

			axiosRequest.params = params;

		} else {

			axiosRequest.data = params;

		}

		axios(axiosRequest)
			.then((result) => {

				resolve(result.data);

			})
			.catch((error) => {

				if (axios.isCancel(error)) {

					reject();

				} else {

					reject(error);

				}

			});

		onCancel(() => {
			axiosSignal.cancel();
		});

	});
