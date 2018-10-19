import React from "react";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export const checkLoginStatus = (appState: any): Promise<boolean> => {

	if (sessionStorage.rollCalUserId
		&& sessionStorage.rollCalUserName
		&& sessionStorage.rollCalUserPermissions
		&& sessionStorage.rollCalToken) {

		return axios.post(appState.apiLocation + "auth/checkToken",
			{
				id: sessionStorage.rollCalUserId,
				permissions: sessionStorage.rollCalUserPermissions,
				username: sessionStorage.rollCalUserName,
			},
			{
				headers: {
					Authorization: `Bearer ${sessionStorage.rollCalToken}`,
				},

		}).then((results: AxiosResponse) => {

			appState.setUserInfo({
				loggedIn: true,
				loggedInUserId: sessionStorage.rollCalUserId,
				loggedInUserName: sessionStorage.rollCalUserName,
				loggedInUserPermissions: sessionStorage.rollCalUserPermissions.split(","),
			});

			return true;

		}).catch((error: AxiosError) => {

			logout(appState);

			return false;

		});

	} else {

			logout(appState);

			return new Promise(() => false);

	}

};

export const logout = (appState: any, event?: React.MouseEvent<HTMLAnchorElement>): void => {

	if (event) {
		event.preventDefault();
	}

	sessionStorage.removeItem("rollCalUserId");
	sessionStorage.removeItem("rollCalUserName");
	sessionStorage.removeItem("rollCalUserPermissions");
	sessionStorage.removeItem("rollCalToken");

	appState.setUserInfo({
		loggedIn: false,
		loggedInUserId: "",
		loggedInUserPermissions: "",
	});

	if (window.location.pathname.match(/^\/dashboard/)) {

		appState.history.push("/");

	}

};
