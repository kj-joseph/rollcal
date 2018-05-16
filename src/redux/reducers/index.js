import { 
	CHANGE_PAGE,
	SAVE_SEARCH,
	SET_MENU_STATE,
	SET_LOGIN_BOX_STATE,
	SET_USER_INFO 
} from "redux/constants/action-types";

const initialState = {
	page: "home",
	lastSearch: "",
	apiLocation: API_URL,
	menuDrawerOpen: false,
	loginBoxOpen: false,
	loggedIn: false,
	loggedInUserId: "",
	loggedInUserAdmin: ""
}

const rootReducer = (state = initialState, action) => {
	let newState = JSON.parse(JSON.stringify(state));
	switch (action.type) {

		case CHANGE_PAGE:
			newState.page = action.payload;
			return newState;
			break;

		case SAVE_SEARCH:
			newState.lastSearch = action.payload;
			return newState;
			break;

		case SET_MENU_STATE:
			newState.menuDrawerOpen = action.payload;
			return newState;
			break;

		case SET_LOGIN_BOX_STATE:
			newState.loginBoxOpen = action.payload;
			return newState;
			break;

		case SET_USER_INFO:
			newState.loggedIn = action.payload.loggedIn;
			newState.loggedInUserId = action.payload.userId;
			newState.loggedInUserAdmin = action.payload.userAdmin;
			return newState;
			break;

		default:
			return state;
	}

};

export default rootReducer;
