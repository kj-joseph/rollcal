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

		const apiCall = callApi(
			"get",
			"user/checkEmail",
			{
				email,
				id,
			},
		)
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

export const checkForgotPassword = (
	validationCode: string,
): Promise<IUserInfo> => {

	return new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"user/checkForgotPassword",
			{
				validationCode,
			},
		)
			.then((response: IDBUserInfo) => {

				resolve({
					userId: response.user_id,
					userName: response.user_name,
				});

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

		const apiCall = callApi(
			"post",
			"user/getSession",
		)
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

		const apiCall = callApi(
			"get",
			"user/checkUsername",
			{
				id,
				username,
			},
		)
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

export const checkUserRole = (
	role: string,
): boolean => {

	const state = store.getState();
	return state.loggedInUserRoles.indexOf(role) > -1;

};

export const filterUserRoles = (
	roles: string[],
): Promise<IUserRole[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getData = getUserRoleList()
			.then((rolesList) => {
				resolve (rolesList.filter((role) =>
					roles.indexOf(role.id.toString()) > -1));
			});

		onCancel(() => {
			getData.cancel();
		});

	});

export const getUserDetails = (
	id: number,
): Promise<IUserInfo> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		const apiCall = callApi(
			"get",
			`admin/getUserDetailsById/${id}`,
		)
			.then((result: IDBUserInfo) => {

				if (result.user_id === state.loggedInUserId
					|| (result.user_roles.indexOf("admin") > -1)
						&& !checkUserRole("superadmin")) {

					reject(new Error("Access to this user denied."));

				} else {

					resolve({
						userEmail: result.user_email,
						userId: result.user_id,
						userName: result.user_name,
						userRoles: result.user_roles,
						userStatus: result.user_status,
					});
				}

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getUserRoleList = (): Promise<IUserRole[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.rolesList && state.rolesList.length) {

			resolve(state.rolesList);

		} else {

			const apiCall = callApi(
				"get",
				"user/getRolesList",
			)
				.then((result: IUserRole[]) => {

					const roleList = result.filter((role) => role.name !== "superadmin");
					store.dispatch(actions.saveRolesList(roleList));
					resolve(roleList);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const logout = (redirect = true): Promise<void> =>

	callApi(
		"get",
		"user/logout",
	)
		.then((result) => {

			store.dispatch(actions.clearUserInfo());

			if (window.location.pathname.match(/^\/dashboard/) && redirect) {

				history.push("/");

			}

		})
		.catch((error) => {

			console.error(error);

		});

export const mapUser = (data: IDBUserInfo | IDBDerbyEvent | IDBDerbyVenue): IUserInfo => ({
	userId: data.user_id,
	userName: data.user_name,
});

export const searchUsers = (
	term: string,
): Promise<IUserInfo[]> => {

	return new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			`admin/searchUsers/${term}`,
		)
			.then((response: IDBUserInfo[]) => {

				resolve(response
					.map((user): IUserInfo => ({
						userEmail: user.user_email,
						userId: user.user_id,
						userName: user.user_name,
						userRoles: user.user_roles,
						userStatus: user.user_status,
					})));

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

};

export const setNewPassword = (
	id: number,
	password: string,
	validationCode: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"user/account/setNewPassword",
			{
				id,
				password,
				validationCode,
			},
		)
			.then(() => {

				resolve();

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const updateUserAsAdmin = (
	id: number,
	changes: {
		email: string,
		name: string,
		roles: IUserRole[],
		status: string,
	},
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			"admin/updateUser",
			Object.assign(changes, {
				id,
				roles: changes.roles.map((role) => role.id).join(","),
			}),
		)
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

export const updateUserProfile = (
	id: number,
	changes: {
		email?: string,
		username?: string,
		newPassword?: string,
		currentPassword?: string,
	},
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			"user/account/update",
			Object.assign(changes, {
				id,
			}),
		)
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
