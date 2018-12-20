import { ISearchObject } from "interfaces/event";
import { IDerbyFeatureType } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IPageTitle, IProps, IReduxActions, IReduxActionType } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IUserInfo, IUserRole } from "interfaces/user";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import reduxActions from "redux/actions";

const mapStateToProps = (reduxState: IProps): IProps => {
	return reduxState;
};

const mapDispatchToProps = (dispatch: Dispatch<IReduxActionType>): IReduxActions => {
	return {
		clearUserInfo: () => dispatch(reduxActions.clearUserInfo()),
		saveCountryList: (data: IGeoCountry[]) => dispatch(reduxActions.saveCountryList(data)),
		saveFeatureLists: (data: IDerbyFeatureType[]) => dispatch(reduxActions.saveFeatureLists(data)),
		saveLastSearch: (search: ISearchObject) => dispatch(reduxActions.saveLastSearch(search)),
		saveRolesList: (data: IUserRole[]) => dispatch(reduxActions.saveRolesList(data)),
		saveTimeZones: (data: ITimeZone[]) => dispatch(reduxActions.saveTimeZones(data)),
		setLoginModalState: (loginModalState: boolean) => dispatch(reduxActions.setLoginModalState(loginModalState)),
		setPageTitle: (data: IPageTitle) => dispatch(reduxActions.setPageTitle(data)),
		setSessionState: (sessionInitialized: boolean) => dispatch(reduxActions.setSessionState(sessionInitialized)),
		setUserInfo: (userState: IUserInfo) => dispatch(reduxActions.setUserInfo(userState)),
	};
};

export const connectClass = (reactClass: React.ComponentClass): React.ComponentClass =>
	connect(mapStateToProps, mapDispatchToProps)(reactClass);
