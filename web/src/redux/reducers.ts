import { ISearchObject } from "interfaces/event";
import { IReduxActionType, IReduxStore } from "interfaces/redux";

const initialState: IReduxStore = {
	apiLocation: process.env.API_URL,
	dataDerbyTypes: [],
	dataGeography: [],
	dataSanctions: [],
	dataTracks: [],
	kmConverter: 1.60934,
	lastSearch: {} as ISearchObject,
	listPageLength: 9,
	loggedIn: false,
	loggedInUserEmail: "",
	loggedInUserId: null,
	loggedInUserName: "",
	loggedInUserRoles: null,
	loginModalOpen: false,
	pageTitle: {
		detail: null,
		page: null,
	},
	rolesList: [],
	sessionInitialized: false,
	timeZones: [],
	userStatusList: [
		"active",
		"unvalidated",
		"deactivated",
		"suspended",
		"banned",
	],
};

const rootReducer = (state = initialState, action: IReduxActionType) => {

	const newState: IReduxStore = JSON.parse(JSON.stringify(state));

	switch (action.type) {

		case "CLEAR_USER_INFO":

			newState.loggedIn = false;
			newState.loggedInUserEmail = "",
			newState.loggedInUserId = null;
			newState.loggedInUserName = "";
			newState.loggedInUserRoles = null;

			return newState;
			break;

		case "SAVE_DATA_DERBYTYPES":

			newState.dataDerbyTypes = action.payload;
			return newState;

			break;

		case "SAVE_DATA_GEOGRAPHY":

			newState.dataGeography = action.payload;
			return newState;

			break;

		case "SAVE_DATA_SANCTIONS":

			newState.dataSanctions = action.payload;
			return newState;

			break;

		case "SAVE_DATA_TRACKS":

			newState.dataTracks = action.payload;
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

			newState.loggedIn = action.payload.loggedIn;
			newState.loggedInUserEmail = action.payload.userEmail;
			newState.loggedInUserId = action.payload.userId;
			newState.loggedInUserName = action.payload.userName;
			newState.loggedInUserRoles = action.payload.userRoles;
			return newState;

			break;

		default:

			return state;

	}

};

export default rootReducer;
