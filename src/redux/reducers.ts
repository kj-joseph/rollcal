import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IGeoData, IGeoRegionList, IReduxActionType } from "components/interfaces";

const initialState = {
	apiLocation: process.env.API_URL,
	dataDerbyTypes: [] as IDerbyType[],
	dataGeography: {
		countries: [] as IGeoCountry[],
		regions: {} as IGeoRegionList,
	},
	dataSanctions: [] as IDerbySanction[],
	dataTracks: [] as IDerbyTrack[],
	lastSearch: "",
	loggedIn: false,
	loggedInUserEmail: "",
	loggedInUserId: "",
	loggedInUserName: "",
	loggedInUserRoles: null as string[],
	loginModalOpen: false,
	menuDrawerOpen: false,
	page: "home",
};

const rootReducer = (state = initialState, action: IReduxActionType) => {

	const newState = JSON.parse(JSON.stringify(state));

	switch (action.type) {

		case "CLEAR_USER_INFO":
			newState.loggedIn = false;
			newState.loggedInUserEmail = "",
			newState.loggedInUserId = "";
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

		case "SET_ACCOUNT_MODAL_STATE":
			newState.accountModalOpen = action.payload;

			if (newState.accountModalOpen) {
				document.getElementsByTagName("html")[0].classList.add("noscroll");
			} else {
				document.getElementsByTagName("html")[0].classList.remove("noscroll");
			}
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

		case "SET_MOBILE_MENU_STATE":
			newState.menuDrawerOpen = action.payload;
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
