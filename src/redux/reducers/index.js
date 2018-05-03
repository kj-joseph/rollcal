import { CHANGE_PAGE, SAVE_SEARCH, SET_MENU_STATE } from "redux/constants/action-types";

const initialState = {
	page: "home",
	lastSearch: "",
	apiLocation: API_URL,
	loggedIn: false,
	menuDrawerOpen: false
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
		default:
			return state;
	}

};

export default rootReducer;
