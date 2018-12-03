import { IDerbyFeature } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IPageTitle, IProps, IReduxActions, IReduxActionType } from "interfaces/redux";
import { ISearchObject } from "interfaces/search";
import { ITimeZone } from "interfaces/time";
import { IUserInfo, IUserRole } from "interfaces/user";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import reduxActions from "redux/actions";

const mapStateToProps = (reduxState: IProps) => {
	return reduxState;
};

const mapDispatchToProps = (dispatch: Dispatch<IReduxActionType>): IReduxActions => {
	return {
		clearUserInfo: () => dispatch(reduxActions.clearUserInfo()),
		saveDataDerbyTypes: (data: IDerbyFeature[]) => dispatch(reduxActions.saveDataDerbyTypes(data)),
		saveDataGeography: (data: IGeoCountry[]) => dispatch(reduxActions.saveDataGeography(data)),
		saveDataSanctions: (data: IDerbyFeature[]) => dispatch(reduxActions.saveDataSanctions(data)),
		saveDataTracks: (data: IDerbyFeature[]) => dispatch(reduxActions.saveDataTracks(data)),
		saveLastSearch: (search: ISearchObject) => dispatch(reduxActions.saveLastSearch(search)),
		saveRolesList: (data: IUserRole[]) => dispatch(reduxActions.saveRolesList(data)),
		saveTimeZones: (data: ITimeZone[]) => dispatch(reduxActions.saveTimeZones(data)),
		setLoginModalState: (loginModalState: boolean) => dispatch(reduxActions.setLoginModalState(loginModalState)),
		setPageTitle: (data: IPageTitle) => dispatch(reduxActions.setPageTitle(data)),
		setSessionState: (sessionInitialized: boolean) => dispatch(reduxActions.setSessionState(sessionInitialized)),
		setUserInfo: (userState: IUserInfo) => dispatch(reduxActions.setUserInfo(userState)),
	};
};

export const connectClass = (reactClass: React.ComponentClass) =>
	connect(mapStateToProps, mapDispatchToProps)(reactClass);
