import { IReduxActionType, IUserInfo } from "interfaces";

export default {

	changePage: (page: string): IReduxActionType => ({
		payload: page,
		type: "CHANGE_PAGE",
	}),

	saveSearch: (search: string): IReduxActionType => ({
		payload: search,
		type: "SAVE_SEARCH",
	}),

	setMenuState: (menuState: boolean): IReduxActionType => ({
		payload: menuState,
		type: "SET_MENU_STATE",
	}),

	setLoginBoxState: (loginBoxState: boolean): IReduxActionType => ({
		payload: loginBoxState,
		type: "SET_LOGIN_BOX_STATE",
	}),

	setUserInfo: (userInfo: IUserInfo): IReduxActionType => ({
		payload: userInfo,
		type: "SET_USER_INFO",
	}),

};
