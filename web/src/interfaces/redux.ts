import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoData, ITimeZone } from "interfaces/geo";
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
	saveDataDerbyTypes: (data: IDerbyType[]) => IReduxActionType;
	saveDataGeography: (data: IGeoData) => IReduxActionType;
	saveDataSanctions: (data: IDerbySanction[]) => IReduxActionType;
	saveDataTracks: (data: IDerbyTrack[]) => IReduxActionType;
	saveLastSearch: (search: string) => IReduxActionType;
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
	dataDerbyTypes: IDerbyType[];
	dataGeography: IGeoData;
	dataSanctions: IDerbySanction[];
	dataTracks: IDerbyTrack[];
	lastSearch: string;
	listPageLength: 9;
	loggedIn: false;
	loggedInUserEmail: string;
	loggedInUserId: number;
	loggedInUserName: string;
	loggedInUserRoles: string[];
	loginModalOpen: false;
	page: "home";
	pageTitle: IPageTitle;
	rolesList: IUserRole[];
	sessionInitialized: false;
	timeZones: ITimeZone[];
	userStatusList: string[];
}
