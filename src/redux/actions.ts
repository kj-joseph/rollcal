import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, IUserInfo } from "components/interfaces";

export default {

	clearUserInfo: (): IReduxActionType => ({
		payload: null,
		type: "CLEAR_USER_INFO",
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

	setAccountModalState: (accountModalState: boolean): IReduxActionType => ({
		payload: accountModalState,
		type: "SET_ACCOUNT_MODAL_STATE",
	}),

	setLoginModalState: (loginModalState: boolean): IReduxActionType => ({
		payload: loginModalState,
		type: "SET_LOGIN_MODAL_STATE",
	}),

	setSessionState: (sessionInitialized: boolean): IReduxActionType => ({
		payload: sessionInitialized,
		type: "SET_SESSION_STATE",
	}),

	setUserInfo: (userInfo: IUserInfo): IReduxActionType => ({
		payload: userInfo,
		type: "SET_USER_INFO",
	}),

};
