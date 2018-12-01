import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoData, ITimeZone } from "interfaces/geo";
import { IPageTitle, IProps, IReduxActions, IReduxActionType } from "interfaces/redux";
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
		saveDataDerbyTypes: (data: IDerbyType[]) => dispatch(reduxActions.saveDataDerbyTypes(data)),
		saveDataGeography: (data: IGeoData) => dispatch(reduxActions.saveDataGeography(data)),
		saveDataSanctions: (data: IDerbySanction[]) => dispatch(reduxActions.saveDataSanctions(data)),
		saveDataTracks: (data: IDerbyTrack[]) => dispatch(reduxActions.saveDataTracks(data)),
		saveLastSearch: (search: string) => dispatch(reduxActions.saveLastSearch(search)),
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
