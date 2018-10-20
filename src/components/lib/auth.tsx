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

		}).then((result: AxiosResponse) => {

			appState.setUserInfo({
				loggedIn: true,
				userEmail: result.data.email,
				userId: result.data.id,
				userName: result.data.username,
				userPermissions: result.data.permissions.split(","),
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

export const logout = (appState: any, event?: React.MouseEvent<any>): void => {

	if (event) {
		event.preventDefault();
	}

	sessionStorage.removeItem("rollCalUserId");
	sessionStorage.removeItem("rollCalUserName");
	sessionStorage.removeItem("rollCalUserPermissions");
	sessionStorage.removeItem("rollCalToken");

	appState.clearUserInfo();

	if (window.location.pathname.match(/^\/dashboard/)) {

		appState.history.push("/");

	}

};
