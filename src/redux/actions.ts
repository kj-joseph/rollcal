import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, IUserInfo } from "interfaces";

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

	setMenuState: (menuState: boolean): IReduxActionType => ({
		payload: menuState,
		type: "SET_MENU_STATE",
	}),

	setLoginBoxState: (loginBoxState: boolean): IReduxActionType => ({
		payload: loginBoxState,
		type: "SET_LOGIN_BOX_STATE",
	}),

	setUserInfo: (userInfo: IUserInfo): IReduxActionType => ({
		payload: userInfo,
		type: "SET_USER_INFO",
	}),

};
