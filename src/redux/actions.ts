export const changePage = (page: string): ActionType => ({
	type: "CHANGE_PAGE",
	payload: page
});

export const saveSearch = (search: string): ActionType => ({
	type: "SAVE_SEARCH",
	payload: search
});

export const setMenuState = (menuState: boolean): ActionType => ({
	type: "SET_MENU_STATE",
	payload: menuState
});

export const setLoginBoxState = (loginBoxState: boolean): ActionType => ({
	type: "SET_LOGIN_BOX_STATE",
	payload: loginBoxState
});

export const setUserInfo = (userInfo: UserInfo): ActionType => ({
	type: "SET_USER_INFO",
	payload: userInfo
});
