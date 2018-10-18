import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch, withRouter } from "react-router-dom";
import ReactSVG from "react-svg";

import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, IUserInfo } from "interfaces";

import { connect, Provider } from "react-redux";
import { Dispatch } from "redux";
import reduxActions from "redux/actions";
import store from "redux/store";

// load css for modules
import "flag-icon-css/sass/flag-icon.scss";
import "react-dates/lib/css/_datepicker.css";

// load site css
import "styles/main.scss";

import ".htaccess";
require.context("images/favicon", true);

// load feature images
require.context("images/derbytypes", true);
require.context("images/sanctions", true);
require.context("images/tracks", true);

// load header images; png is for emails
import "images/header-logo.png";
import HeaderLogo from "images/header-logo.svg";

// load image for mobile menu
import MenuDrawer from "images/menu/drawer.svg";

class ConnectedSiteRouter<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.toggleMenuDrawer = this.toggleMenuDrawer.bind(this);
	}

	toggleMenuDrawer() {
		this.props.setMenuState(!this.props.menuDrawerOpen);
	}

	render() {

		return (
			<Router>
				<div id="pageWrapper" className={typeof(process.env.ENV) !== "undefined" ? `env-${process.env.ENV}` : ""}>
					<LoginBox />
					<div id="siteHeader">
						<ReactSVG
							id="siteLogo"
							src={HeaderLogo}
						/>
						<div id="siteMenuHeader">
							<SiteMenuComponent />
						</div>
					</div>
					<div id="siteMenuDrawer" className={this.props.menuDrawerOpen ? " drawerOpen" : "drawerClosed"}>
						<div className="openDrawerIcon" >
							<ReactSVG
								className="openDrawerIcon"
								onClick={this.toggleMenuDrawer}
								src={MenuDrawer}
								title="Open site menu"
							/>
						</div>
						<SiteMenuComponent />
					</div>

					<div id="content">
						<Switch>
							<Route path="/validate/:validationCode" component={ValidatePage} exact={true} />
							<Route path="/event/:eventId?" component={EventDetailsPage} exact={true} />
							<Route path="/search" component={SearchPage} exact={true} />
							<Route path="/faq" component={FaqPage} exact={true} />
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(locations.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(derbytypes.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(sanctions.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(tracks.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(locations.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(derbytypes.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(sanctions.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(tracks.*)"
								component={EventsPage}
							/>
							<Route
								path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/"
								component={EventsPage}
							/>
							<Route
								path="/:param1(locations.*)"
								component={EventsPage}
							/>
							<Route
								path="/:param1(derbytypes.*)"
								component={EventsPage}
							/>
							<Route
								path="/:param1(sanctions.*)"
								component={EventsPage}
							/>
							<Route
								path="/:param1(tracks.*)"
								component={EventsPage}
							/>
							<Route path="/" component={EventsPage} exact={true} />
							<Route component={NotFoundPage} />
						</Switch>
					</div>

				</div>
			</Router>
		);
	}

}

const RedirectHome = withRouter(({ history }) => {
	history.push("/events");
	return null;
});

const mapStateToProps = (reduxState: {[key: string]: any}) => {
	return reduxState;
};

const mapDispatchToProps = (dispatch: Dispatch<IReduxActionType>) => {
	return {
		changePage: (page: string) => dispatch(reduxActions.changePage(page)),
		saveDataDerbyTypes: (data: IDerbyType[]) => dispatch(reduxActions.saveDataDerbyTypes(data)),
		saveDataGeography: (data: IGeoCountry[]) => dispatch(reduxActions.saveDataGeography(data)),
		saveDataSanctions: (data: IDerbySanction[]) => dispatch(reduxActions.saveDataSanctions(data)),
		saveDataTracks: (data: IDerbyType[]) => dispatch(reduxActions.saveDataTracks(data)),
		saveLastSearch: (search: string) => dispatch(reduxActions.saveLastSearch(search)),
		setLoginBoxState: (loginBoxState: boolean) => dispatch(reduxActions.setLoginBoxState(loginBoxState)),
		setMenuState: (menuState: boolean) => dispatch(reduxActions.setMenuState(menuState)),
		setUserInfo: (userState: IUserInfo) => dispatch(reduxActions.setUserInfo(userState)),
	};
};

import Error404 from "components/404";
import EventDetails from "components/eventDetails";
import Events from "components/events";
import Faq from "components/faq";
import Search from "components/search";
import SiteMenu from "components/siteMenu";
import Validate from "components/validate";

import Login from "components/login";

const EventDetailsPage = connect(mapStateToProps, mapDispatchToProps)(EventDetails);
const EventsPage = connect(mapStateToProps, mapDispatchToProps)(Events);
const FaqPage = connect(mapStateToProps, mapDispatchToProps)(Faq);
const LoginBox = connect(mapStateToProps, mapDispatchToProps)(Login);
const NotFoundPage = connect(mapStateToProps, mapDispatchToProps)(Error404);
const SearchPage = connect(mapStateToProps, mapDispatchToProps)(Search);
const SiteMenuComponent = connect(mapStateToProps, mapDispatchToProps)(SiteMenu);
const SiteRouter = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteRouter);
const ValidatePage = connect(mapStateToProps, mapDispatchToProps)(Validate);

render(
	<Provider store={store}>
		<SiteRouter />
	</Provider>,
	document.getElementById("root"));
