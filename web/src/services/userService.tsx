import history from "components/history";
import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { IDBDerbyEvent } from "interfaces/event";
import { IDBUserInfo, IUserInfo, IUserRole } from "interfaces/user";
import { IDBDerbyVenue } from "interfaces/venue";

export const checkEmail = (
	email: string,
	id: number,
): Promise<boolean> => {

	return new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("get", "user/checkEmail", {
			email,
			id,
		})
		.then((response) => {

			resolve(response);

		})
		.catch((error) => {

			reject(error);

		});

		onCancel(() => {
			apiCall.cancel();
		});

	});

};

export const checkLoginStatus = (): Promise<boolean> => {

	return new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("post", "user/getSession")
			.then((result: IDBUserInfo) => {

				store.dispatch(actions.setUserInfo({
					loggedIn: true,
					userEmail: result.user_email,
					userId: result.user_id,
					userName: result.user_name,
					userRoles: result.user_roles,
				}));

				resolve();

			})
			.catch((error) => {

				reject(new Error("User not logged in."));

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

};

export const checkUsername = (
	username: string,
	id: number,
): Promise<boolean> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("get", "user/checkUsername", {
			id,
			username,
		})
		.then((response) => {

			resolve(response);

		})
		.catch((error) => {

			reject(error);

		});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const checkUserRole = (userRoles: string[], role: string): boolean =>
	userRoles && userRoles.indexOf(role) > -1;

export const logout = (redirect = true): Promise<void> =>

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

export const getUserRoles = (): Promise<IUserRole[]> =>

	new Promise((resolve, reject, onCancel) => {
		const state = store.getState();

		if (state.rolesList && state.rolesList.length) {

			resolve(state.rolesList);

		} else {

			const apiCall = callApi("get", "user/getRolesList")

				.then((result: IUserRole[]) => {

					store.dispatch(actions.saveRolesList(
							result.filter((role) => role.name !== "superadmin")));

					resolve(result.filter((role) => role.name !== "superadmin"));

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const mapUser = (data: IDBUserInfo | IDBDerbyEvent | IDBDerbyVenue): IUserInfo => ({
	userId: data.user_id,
	userName: data.user_name,
});

export const updateUser = (
	id: number,
	changes: {
		email?: string,
		username?: string,
		newPassword?: string,
		currentPassword?: string,
	},
) =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi("put", "user/account/update", Object.assign(changes, {
			id,
		}))
		.then((response) => {

			resolve(response);

		})
		.catch((error) => {

			reject(error);

		});

		onCancel(() => {
			apiCall.cancel();
		});

	});
