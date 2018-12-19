import store from "redux/store";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const callApi = (
	method: "delete" | "get" | "patch" | "post" | "put",
	path: string,
	params: {
		[key: string]: any,
	} = {},
)
: Promise<AxiosResponse> =>

	new Promise((resolve, reject, onCancel) => {

		const axiosSignal = axios.CancelToken.source();
		const state = store.getState();

		const callParams: {[key: string]: any} = {};

		if (Object.keys(params).length) {

			// remove empty parameters
			Object.keys(params)
				.forEach((key) => {
					if (params[key] !== undefined) {
						callParams[key] = params[key];
					}
				});

		}

		const axiosRequest: AxiosRequestConfig = {
			cancelToken: axiosSignal.token,
			method,
			url: `${state.apiLocation}${path}`,
			withCredentials: true,
		};

		if (method === "get") {

			axiosRequest.params = callParams;

		} else {

			axiosRequest.data = callParams;

		}

		axios(axiosRequest)
			.then((response) => {

				resolve(response);

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
