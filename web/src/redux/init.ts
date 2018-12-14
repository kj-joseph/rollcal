import { ISearchObject } from "interfaces/event";
import { IReduxStore } from "interfaces/redux";

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

export default initialState;
