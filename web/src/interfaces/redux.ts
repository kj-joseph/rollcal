import { ISearchObject } from "interfaces/event";
import { IDerbyFeature } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { ITimeZone } from "interfaces/time";
import { IUserInfo, IUserRole } from "interfaces/user";

import { RouteComponentProps } from "react-router";

interface IMatchParams {
	[key: string]: any;
}

export interface IPageTitle {
	detail?: string;
	page?: string;
}

export interface IProps extends IReduxActions, IReduxStore, RouteComponentProps<IMatchParams> {
}

export interface IReduxActions {
	clearUserInfo: () => IReduxActionType;
	saveDataDerbyTypes: (data: IDerbyFeature[]) => IReduxActionType;
	saveDataGeography: (data: IGeoCountry[]) => IReduxActionType;
	saveDataSanctions: (data: IDerbyFeature[]) => IReduxActionType;
	saveDataTracks: (data: IDerbyFeature[]) => IReduxActionType;
	saveLastSearch: (search: ISearchObject) => IReduxActionType;
	saveRolesList: (roles: IUserRole[]) => IReduxActionType;
	saveTimeZones: (data: ITimeZone[]) => IReduxActionType;
	setLoginModalState: (loginModalState: boolean) => IReduxActionType;
	setPageTitle: (pageTitle: IPageTitle) => IReduxActionType;
	setSessionState: (sessionInitialized: boolean) => IReduxActionType;
	setUserInfo: (userInfo: IUserInfo) => IReduxActionType;
}

export interface IReduxActionType {
	type: string;
	payload: any;
}

export interface IReduxStore {
	apiLocation: string;
	dataDerbyTypes: IDerbyFeature[];
	dataGeography: IGeoCountry[];
	dataSanctions: IDerbyFeature[];
	dataTracks: IDerbyFeature[];
	kmConverter: number;
	lastSearch: ISearchObject;
	listPageLength: number;
	loggedIn: boolean;
	loginModalOpen: false;
	pageTitle: IPageTitle;
	rolesList: IUserRole[];
	sessionInitialized: boolean;
	timeZones: ITimeZone[];
	user: IUserInfo;
	userStatusList: string[];
}
