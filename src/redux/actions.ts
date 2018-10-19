import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, IUserInfo } from "components/interfaces";

export default {

	changePage: (page: string): IReduxActionType => ({
		payload: page,
		type: "CHANGE_PAGE",
	}),

	saveDataDerbyTypes: (data: IDerbyType[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_DERBYTYPES",
	}),

	saveDataGeography: (data: IGeoCountry[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_GEOGRAPHY",
	}),

	saveDataSanctions: (data: IDerbySanction[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_SANCTIONS",
	}),

	saveDataTracks: (data: IDerbyType[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_TRACKS",
	}),

	saveLastSearch: (search: string): IReduxActionType => ({
		payload: search,
		type: "SAVE_LAST_SEARCH",
	}),

	setMobileMenuState: (menuState: boolean): IReduxActionType => ({
		payload: menuState,
		type: "SET_MOBILE_MENU_STATE",
	}),

	setLoginModalState: (loginModalState: boolean): IReduxActionType => ({
		payload: loginModalState,
		type: "SET_LOGIN_MODAL_STATE",
	}),

	setUserInfo: (userInfo: IUserInfo): IReduxActionType => ({
		payload: userInfo,
		type: "SET_USER_INFO",
	}),

};
