import history from "components/history";
import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { IUserInfo, IUserRole } from "interfaces/user";

export const checkEmail = (
	email: string,
	id: number = undefined,
): Promise<boolean> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"user",
			{
				email,
				id,
			},
		)
			.then((response) => {

				resolve(response.status === 200);

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const checkForgotPassword = (
	code: string,
): Promise<IUserInfo> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"forgot-password",
			{
				validationCode: code,
			},
		)
			.then((response) => {

				const userInfo: IUserInfo = response.data;
				resolve({
					id: userInfo.id,
					name: userInfo.name,
				});

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const checkUsername = (
	username: string,
	id: number = undefined,
): Promise<boolean> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"user",
			{
				id,
				username,
			},
		)
			.then((response) => {

				resolve(response.status === 200);

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
	return state.user.roles.indexOf(role) > -1;

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
			`user/${id}`,
		)
			.then((response) => {

				const userInfo: IUserInfo = response.data;

				if (userInfo.id === state.user.id
					|| (userInfo.roles.indexOf("admin") > -1)
						&& !checkUserRole("superadmin")) {

					reject(new Error("Access to this user denied."));

				} else {

					resolve(userInfo);
				}

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getUserRoleList = ()
	: Promise<IUserRole[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.rolesList && state.rolesList.length) {

			resolve(state.rolesList);

		} else {

			const apiCall = callApi(
				"get",
				"roles",
			)
				.then((response) => {

					const roles: IUserRole[] = response.data;
					const roleList = roles.filter((role) => role.name !== "superadmin");
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

export const getUserSession = (): Promise<boolean> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"session",
		)
			.then((response) => {

				const userInfo: IUserInfo = response.data;
				store.dispatch(actions.setUserInfo(userInfo));
				resolve();

			})
			.catch((error) => {

				reject(new Error("User not logged in."));

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const login = (
	email: string,
	password: string,
): Promise<IUserInfo> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"session",
			{
				email,
				password,
			},
		)
			.then((response) => {

				const userInfo: IUserInfo = response.data;
				resolve(userInfo);

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const logout = (
	redirect = true,
): Promise<void> =>

	callApi(
		"delete",
		"session",
	)
		.then(() => {

			store.dispatch(actions.clearUserInfo());

			if (window.location.pathname.match(/^\/dashboard/) && redirect) {

				history.push("/");

			}

		})
		.catch((error) => {

			console.error(error);

		});

export const registerUser = (
	email: string,
	password: string,
	username: string,
): Promise<IUserInfo> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"user",
			{
				email,
				password,
				username,
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

export const searchUsers = (
	term: string,
): Promise<IUserInfo[]> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			"users",
			{
				search: term,
			},
		)
			.then((response) => {

				const userList: IUserInfo[] = response.data;
				resolve(userList);

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const setNewPassword = (
	id: number,
	password: string,
	code: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			"user",
			{
				id,
				password,
				validationCode: code,
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

export const submitForgotPassword = (
	email: string,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"post",
			"forgot-password",
			{
				email,
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
			`user/${id}`,
			Object.assign(changes, {
				roles: changes.roles
					.map((role) => role.id)
					.join(","),
			}),
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
			`user/${id}`,
			changes,
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

export const validateAccount = (
	code: string,
): Promise<IUserInfo> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			"validation",
			{
				validationCode: code,
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
