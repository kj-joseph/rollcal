import { CHANGE_PAGE } from "redux/constants/action-types";
import { SAVE_SEARCH } from "redux/constants/action-types";
import { SET_MENU_STATE } from "redux/constants/action-types";
import { SET_LOGIN_BOX_STATE } from "redux/constants/action-types";
import { SET_USER_INFO } from "redux/constants/action-types";

export const changePage = page => ({
	type: CHANGE_PAGE,
	payload: page
});

export const saveSearch = search => ({
	type: SAVE_SEARCH,
	payload: search
});

export const setMenuState = menuState => ({
	type: SET_MENU_STATE,
	payload: menuState
});

export const setLoginBoxState = loginBoxState => ({
	type: SET_LOGIN_BOX_STATE,
	payload: loginBoxState
});

export const setUserInfo = userInfo => ({
	type: SET_USER_INFO,
	payload: userInfo
});
