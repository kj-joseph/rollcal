import React from "react";
import { render } from "react-dom";
import { BrowserRouter, NavLink, Route, Switch } from "react-router-dom";
import ReactSVG from "react-svg";

import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IReduxActionType, ITimeZone, IUserInfo } from "components/interfaces";

import { connect, Provider } from "react-redux";
import { Dispatch } from "redux";
import reduxActions from "redux/actions";
import store from "redux/store";

import * as auth from "components/lib/auth";

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

class ConnectedSiteRouter<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.openLoginModal = this.openLoginModal.bind(this);

	}

	componentDidMount() {

		if (!this.props.sessionInitialized) {

			auth.checkLoginStatus(this.props).then(() => {
				this.props.setSessionState(true);
			});

		}

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
						<div id="loginUserIconMobile">
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
					<div id="siteMenuMobile">
						<SiteMenuComponent />
					</div>

					<div id="content">
						{ this.props.sessionInitialized ?
							<Switch>
								<Route path="/validate/:validationCode" component={ValidatePage} exact={true} />
								<Route path="/event/:eventId?" component={EventDetailsPage} exact={true} />
								<Route path="/dashboard/event/:operation(add|edit)/:eventId(\d+)?" component={EventFormPage} exact={true} />
								<Route path="/dashboard/:operation(events|venues|changes|users)?" component={DashboardPage} exact={true} />
								<Route path="/search" component={SearchPage} exact={true} />
								<Route path="/faq" component={FaqPage} exact={true} />
								<Route path="/contact" component={ContactPage} exact={true} />
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
						:

							<div className="loader" />

						}
					</div>

					<LoginModal />
					<AccountModal />

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
		clearUserInfo: () => dispatch(reduxActions.clearUserInfo()),
		saveDataDerbyTypes: (data: IDerbyType[]) => dispatch(reduxActions.saveDataDerbyTypes(data)),
		saveDataGeography: (data: IGeoCountry[]) => dispatch(reduxActions.saveDataGeography(data)),
		saveDataSanctions: (data: IDerbySanction[]) => dispatch(reduxActions.saveDataSanctions(data)),
		saveDataTracks: (data: IDerbyTrack[]) => dispatch(reduxActions.saveDataTracks(data)),
		saveLastSearch: (search: string) => dispatch(reduxActions.saveLastSearch(search)),
		saveTimeZones: (data: ITimeZone[]) => dispatch(reduxActions.saveTimeZones(data)),
		setAccountModalState: (accountModalState: boolean) => dispatch(reduxActions.setAccountModalState(accountModalState)),
		setLoginModalState: (loginModalState: boolean) => dispatch(reduxActions.setLoginModalState(loginModalState)),
		setSessionState: (sessionInitialized: boolean) => dispatch(reduxActions.setSessionState(sessionInitialized)),
		setUserInfo: (userState: IUserInfo) => dispatch(reduxActions.setUserInfo(userState)),
	};
};

import Contact from "components/pages/contact";
import Dashboard from "components/pages/dashboard";
import EventDetails from "components/pages/eventDetails";
import EventForm from "components/pages/eventForm";
import Events from "components/pages/events";
import Faq from "components/pages/faq";
import Search from "components/pages/search";
import Validate from "components/pages/validate";
import Account from "components/partials/account";
import Login from "components/partials/login";
import SiteMenu from "components/partials/siteMenu";
import Error404 from "components/status/404";

const ContactPage = connect(mapStateToProps, mapDispatchToProps)(Contact);
const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(Dashboard);
const EventDetailsPage = connect(mapStateToProps, mapDispatchToProps)(EventDetails);
const EventFormPage = connect(mapStateToProps, mapDispatchToProps)(EventForm);
const EventsPage = connect(mapStateToProps, mapDispatchToProps)(Events);
const FaqPage = connect(mapStateToProps, mapDispatchToProps)(Faq);
const NotFoundPage = connect(mapStateToProps, mapDispatchToProps)(Error404);
const SearchPage = connect(mapStateToProps, mapDispatchToProps)(Search);
const SiteMenuComponent = connect(mapStateToProps, mapDispatchToProps)(SiteMenu);
const SiteRouter = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteRouter);
const AccountModal = connect(mapStateToProps, mapDispatchToProps)(Account);
const LoginModal = connect(mapStateToProps, mapDispatchToProps)(Login);
const ValidatePage = connect(mapStateToProps, mapDispatchToProps)(Validate);

render(
	<Provider store={store}>
		<SiteRouter />
	</Provider>,
	document.getElementById("root"));
