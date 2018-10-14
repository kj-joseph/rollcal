import { IReduxActionType, IUserInfo } from "interfaces";

export const changePage = (page: string): IReduxActionType => ({
	payload: page,
	type: "CHANGE_PAGE",
});

export const saveSearch = (search: string): IReduxActionType => ({
	payload: search,
	type: "SAVE_SEARCH",
});

export const setMenuState = (menuState: boolean): IReduxActionType => ({
	payload: menuState,
	type: "SET_MENU_STATE",
});

export const setLoginBoxState = (loginBoxState: boolean): IReduxActionType => ({
	payload: loginBoxState,
	type: "SET_LOGIN_BOX_STATE",
});

export const setIUserInfo = (userInfo: IUserInfo): IReduxActionType => ({
	payload: userInfo,
	type: "SET_USER_INFO",
});
