import { IReduxActionType, IUserInfo } from "interfaces";

export const changePage = (page: string): IReduxActionType => ({
	type: "CHANGE_PAGE",
	payload: page
});

export const saveSearch = (search: string): IReduxActionType => ({
	type: "SAVE_SEARCH",
	payload: search
});

export const setMenuState = (menuState: boolean): IReduxActionType => ({
	type: "SET_MENU_STATE",
	payload: menuState
});

export const setLoginBoxState = (loginBoxState: boolean): IReduxActionType => ({
	type: "SET_LOGIN_BOX_STATE",
	payload: loginBoxState
});

export const setIUserInfo = (userInfo: IUserInfo): IReduxActionType => ({
	type: "SET_USER_INFO",
	payload: userInfo
});
