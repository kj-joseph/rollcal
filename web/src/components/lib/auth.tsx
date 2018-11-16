import React from "react";

import { History } from "history";
import { IUserInfo } from "interfaces/redux";

import axios, { AxiosError, AxiosResponse } from "axios";

export const checkLoginStatus = (
	apiLocation: string,
	setUserInfo: (userInfo: IUserInfo) => void,
): Promise<void> => {

	return axios.post(apiLocation + "user/getSession", {}, { withCredentials: true })
		.then((result: AxiosResponse) => {

			setUserInfo({
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

export const logout = (
	apiLocation: string,
	clearUserInfo: () => void,
	history: History,
	event?: React.MouseEvent<any>,
	redirect = true,
): Promise<void> => {

	if (event) {
		event.preventDefault();
	}

	return axios.get(apiLocation + "user/logout", { withCredentials: true })
		.then((result: AxiosResponse) => {

			clearUserInfo();

			if (window.location.pathname.match(/^\/dashboard/) && redirect) {

				history.push("/");

			}

		}).catch((error: AxiosError) => {

			console.error(error);

		});

};
