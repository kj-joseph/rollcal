import React from "react";

import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/api";
import history from "services/history";

import { IDBDerbyEvent } from "interfaces/event";
import { IDBUserInfo, IUserInfo, IUserRole } from "interfaces/user";
import { IDBDerbyVenue } from "interfaces/venue";

export const checkLoginStatus = (): Promise<boolean> => {

	return new Promise((resolve, reject) => {

		callApi("post", "user/getSession")
			.then((result: IDBUserInfo) => {

				store.dispatch(actions.setUserInfo({
					loggedIn: true,
					userEmail: result.user_email,
					userId: result.user_id,
					userName: result.user_name,
					userRoles: result.user_roles,
				}));

				resolve(true);

			})
			.catch((error) => {

				if (error.response.status === 403) {
					// not logged in

					resolve(false);

				} else {
					// other errors

					reject(false);
				}

			});

	});

};

export const checkUserRole = (userRoles: string[], role: string): boolean =>
	userRoles && userRoles.indexOf(role) > -1;

export const logout = (event?: React.MouseEvent<any>, redirect = true): Promise<void> => {

	if (event) {
		event.preventDefault();
	}

	return new Promise((resolve, reject) => {

		callApi("get", "user/logout")
			.then((result) => {

				store.dispatch(actions.clearUserInfo());

				if (window.location.pathname.match(/^\/dashboard/) && redirect) {

					history.push("/");

				}

			})
			.catch((error) => {

				console.error(error);

			});

	});

};

export const getUserRoles = (): Promise<IUserRole[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.rolesList && state.rolesList.length) {

			resolve(state.rolesList);

		} else {

			callApi("get", "user/getRolesList")

				.then((result: IUserRole[]) => {

					store.dispatch(actions.saveRolesList(
							result.filter((role) => role.name !== "superadmin")));

					resolve(result.filter((role) => role.name !== "superadmin"));

				})
				.catch((error) => {

					reject(error);

				});
		}

	});
};

export const mapUser = (data: IDBUserInfo | IDBDerbyEvent | IDBDerbyVenue): IUserInfo => ({
	userId: data.user_id,
	userName: data.user_name,
});
