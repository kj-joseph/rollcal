import { IReduxActionType, IReduxStore } from "interfaces/redux";
import { IUserInfo } from "interfaces/user";

import initialState from "redux/init";

const rootReducer = (state = initialState, action: IReduxActionType): IReduxStore => {

	const newState: IReduxStore = JSON.parse(JSON.stringify(state));

	switch (action.type) {

		case "CLEAR_USER_INFO":

			newState.loggedIn = false;
			newState.user = {} as IUserInfo;

			return newState;
			break;

		case "SAVE_COUNTRY_LIST":

			newState.countryList = action.payload;
			return newState;

			break;

		case "SAVE_FEATURE_LISTS":

			newState.featureLists = action.payload;
			return newState;

			break;

		case "SAVE_LAST_SEARCH":

			newState.lastSearch = action.payload;
			return newState;

			break;

		case "SAVE_TIME_ZONES":

			newState.timeZones = action.payload;
			return newState;

			break;

		case "SET_LOGIN_MODAL_STATE":

			newState.loginModalOpen = action.payload;

			if (newState.loginModalOpen) {
				document.getElementsByTagName("html")[0].classList.add("noscroll");
			} else {
				document.getElementsByTagName("html")[0].classList.remove("noscroll");
			}
			return newState;

			break;

		case "SET_PAGE_TITLE":

			if (action.payload.hasOwnProperty("page")) {
				newState.pageTitle.page = action.payload.page;

				if (!action.payload.hasOwnProperty("detail")) {
					newState.pageTitle.detail = null;
				}

			}

			if (action.payload.hasOwnProperty("detail")) {
				newState.pageTitle.detail = action.payload.detail;
			}

			document.title = (newState.pageTitle.detail ? `${newState.pageTitle.detail} | ` : "")
				+ (newState.pageTitle.page ? `${newState.pageTitle.page} | ` : "")
				+ "Roll-Cal - Roller derby event calendar";

			return newState;

			break;

		case "SAVE_ROLES_LIST":

			newState.rolesList = action.payload;
			return newState;

			break;

		case "SET_SESSION_STATE":

			newState.sessionInitialized = action.payload;
			return newState;

			break;

		case "SET_USER_INFO":

			newState.loggedIn = true;
			newState.user = action.payload;
			return newState;

			break;

		default:

			return state;

	}

};

export default rootReducer;
