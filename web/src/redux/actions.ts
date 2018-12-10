import { ISearchObject } from "interfaces/event";
import { IDerbyFeature } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IPageTitle, IReduxActionType } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IUserInfo, IUserRole } from "interfaces/user";

export default {

	clearUserInfo: (): IReduxActionType => ({
		payload: null,
		type: "CLEAR_USER_INFO",
	}),

	saveDataDerbyTypes: (data: IDerbyFeature[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_DERBYTYPES",
	}),

	saveDataGeography: (data: IGeoCountry[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_GEOGRAPHY",
	}),

	saveDataSanctions: (data: IDerbyFeature[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_SANCTIONS",
	}),

	saveDataTracks: (data: IDerbyFeature[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_DATA_TRACKS",
	}),

	saveLastSearch: (search: ISearchObject): IReduxActionType => ({
		payload: search,
		type: "SAVE_LAST_SEARCH",
	}),

	saveRolesList: (roles: IUserRole[]): IReduxActionType => ({
		payload: roles,
		type: "SAVE_ROLES_LIST",
	}),

	saveTimeZones: (data: ITimeZone[]): IReduxActionType => ({
		payload: data,
		type: "SAVE_TIME_ZONES",
	}),

	setLoginModalState: (loginModalState: boolean): IReduxActionType => ({
		payload: loginModalState,
		type: "SET_LOGIN_MODAL_STATE",
	}),

	setPageTitle: (pageTitle: IPageTitle): IReduxActionType => ({
		payload: pageTitle,
		type: "SET_PAGE_TITLE",
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
