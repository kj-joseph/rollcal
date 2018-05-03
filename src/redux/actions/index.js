import { CHANGE_PAGE } from "redux/constants/action-types";
import { SAVE_SEARCH } from "redux/constants/action-types";
import { SET_MENU_STATE } from "redux/constants/action-types";

export const changePage = page => ({
	type: CHANGE_PAGE,
	payload: page
});

export const saveSearch = search => ({
	type: SAVE_SEARCH,
	payload: search
});

export const setMenuState = page => ({
	type: SET_MENU_STATE,
	payload: page
});
