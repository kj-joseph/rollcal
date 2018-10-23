import React from "react";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export const checkLoginStatus = (appState: any): Promise<void> => {

	return axios.post(appState.apiLocation + "user/getSession", {}, { withCredentials: true })
		.then((result: AxiosResponse) => {

			appState.setUserInfo({
				loggedIn: true,
				userEmail: result.data.email,
				userId: result.data.id,
				userName: result.data.username,
				userRoles: result.data.roles,
			});

		}).catch((error: AxiosError) => {

			// Not logged in and that's ok.

		});

};

export const logout = (appState: any, event?: React.MouseEvent<any>): Promise<void> => {

	if (event) {
		event.preventDefault();
	}

	return axios.get(appState.apiLocation + "user/logout", { withCredentials: true })
		.then((result: AxiosResponse) => {

			appState.clearUserInfo();

			if (window.location.pathname.match(/^\/dashboard/)) {

				appState.history.push("/");

			}

		}).catch((error: AxiosError) => {

			console.error(error);

		});

};
