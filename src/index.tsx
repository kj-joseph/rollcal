import React from "react";
import { render } from "react-dom";
import { BrowserRouter, NavLink, Route, Switch } from "react-router-dom";
import ReactSVG from "react-svg";

import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, IUserInfo } from "components/interfaces";

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
import LoginIconSolid from "images/menu/user-circle-solid.svg";
import LoginIconOutline from "images/menu/user-circle.svg";

// load image for mobile menu
import MenuDrawer from "images/menu/drawer.svg";

class ConnectedSiteRouter<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.openLoginModal = this.openLoginModal.bind(this);
		this.toggleMenuDrawer = this.toggleMenuDrawer.bind(this);
	}

	toggleMenuDrawer() {
		this.props.setMobileMenuState(!this.props.menuDrawerOpen);
	}

	openLoginModal(event?: React.MouseEvent<HTMLAnchorElement>) {

		if (event) {
			event.preventDefault();
		}

		this.props.setLoginModalState(true);

	}

	render() {

		return (
			<BrowserRouter>
				<div id="pageWrapper" className={typeof(process.env.ENV) !== "undefined" ? `env-${process.env.ENV}` : ""}>
					<div id="siteHeader">
						<ReactSVG id="siteLogo" src={HeaderLogo} />
						<div id="siteMenuHeader">
							<SiteMenuComponent />
						</div>
						<div id="loginMenuIconMobile">
						{this.props.loggedIn ?
							<NavLink to="/dashboard" title="Dashboard" activeClassName="activeIcon">
								<ReactSVG src={LoginIconSolid} />
							</NavLink>
						:
							<a href="" onClick={this.openLoginModal} title="Login / Register">
								<ReactSVG src={LoginIconOutline} />
							</a>
						}
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
							<Route path="/dashboard" component={DashboardPage} exact={true} />
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

					<LoginMenu />

				</div>

			</BrowserRouter>
		);
	}

}

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
		setLoginModalState: (loginModalState: boolean) => dispatch(reduxActions.setLoginModalState(loginModalState)),
		setMobileMenuState: (menuState: boolean) => dispatch(reduxActions.setMobileMenuState(menuState)),
		setUserInfo: (userState: IUserInfo) => dispatch(reduxActions.setUserInfo(userState)),
	};
};

import Dashboard from "components/pages/dashboard";
import EventDetails from "components/pages/eventDetails";
import Events from "components/pages/events";
import Faq from "components/pages/faq";
import Search from "components/pages/search";
import Validate from "components/pages/validate";
import Login from "components/partials/login";
import SiteMenu from "components/partials/siteMenu";
import Error404 from "components/status/404";

const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(Dashboard);
const EventDetailsPage = connect(mapStateToProps, mapDispatchToProps)(EventDetails);
const EventsPage = connect(mapStateToProps, mapDispatchToProps)(Events);
const FaqPage = connect(mapStateToProps, mapDispatchToProps)(Faq);
const NotFoundPage = connect(mapStateToProps, mapDispatchToProps)(Error404);
const SearchPage = connect(mapStateToProps, mapDispatchToProps)(Search);
const SiteMenuComponent = connect(mapStateToProps, mapDispatchToProps)(SiteMenu);
const SiteRouter = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteRouter);
const LoginMenu = connect(mapStateToProps, mapDispatchToProps)(Login);
const ValidatePage = connect(mapStateToProps, mapDispatchToProps)(Validate);

render(
	<Provider store={store}>
		<SiteRouter />
	</Provider>,
	document.getElementById("root"));
