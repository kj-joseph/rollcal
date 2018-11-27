import React from "react";

import { History } from "history";
import { IUserInfo } from "interfaces/user";

import axios from "axios";

export const checkLoginStatus = (
	apiLocation: string,
	setUserInfo: (userInfo: IUserInfo) => void,
): Promise<void> => {

	return axios.post(apiLocation + "user/getSession", {}, { withCredentials: true })
		.then((result) => {

			setUserInfo({
				loggedIn: true,
				userEmail: result.data.email,
				userId: result.data.id,
				userName: result.data.username,
				userRoles: result.data.roles,
			});

		}).catch((error) => {

			// Not logged in and that's ok.

		});

};

export const checkUserRole = (userRoles: string[], role: string): boolean =>
	userRoles && userRoles.indexOf(role) > -1;

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
		.then((result) => {

			clearUserInfo();

			if (window.location.pathname.match(/^\/dashboard/) && redirect) {

				history.push("/");

			}

		}).catch((error) => {

			console.error(error);

		});

};
