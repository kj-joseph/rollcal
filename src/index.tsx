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
						<NavLink to="/" title="Roll-Cal.com">
							<ReactSVG id="siteLogo" src={HeaderLogo} />
						</NavLink>
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
								<Route path="/dashboard/events/:operation(add|edit)/:eventId(\d+)?" component={EventFormPage} exact={true} />
								<Route path="/dashboard/venues/:operation(add|edit)/:venueId(\d+)?" component={VenueFormPage} exact={true} />
								<Route path="/dashboard/events" component={UserEventsPage} exact={true} />
								<Route path="/dashboard/venues" component={UserVenuesPage} exact={true} />
								<Route path="/dashboard/account" component={UserAccountPage} exact={true} />
								<Route path="/dashboard" component={DashboardPage} exact={true} />
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

const SiteRouter = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteRouter);

import Contact from "components/pages/contact";
const ContactPage = connect(mapStateToProps, mapDispatchToProps)(Contact);

import Dashboard from "components/pages/dashboard";
const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

import EventDetails from "components/pages/eventDetails";
const EventDetailsPage = connect(mapStateToProps, mapDispatchToProps)(EventDetails);

import EventForm from "components/pages/eventForm";
const EventFormPage = connect(mapStateToProps, mapDispatchToProps)(EventForm);

import Events from "components/pages/events";
const EventsPage = connect(mapStateToProps, mapDispatchToProps)(Events);

import Faq from "components/pages/faq";
const FaqPage = connect(mapStateToProps, mapDispatchToProps)(Faq);

import Search from "components/pages/search";
const SearchPage = connect(mapStateToProps, mapDispatchToProps)(Search);

import UserAccount from "components/pages/userAccount";
const UserAccountPage = connect(mapStateToProps, mapDispatchToProps)(UserAccount);

import UserEvents from "components/pages/userEvents";
const UserEventsPage = connect(mapStateToProps, mapDispatchToProps)(UserEvents);

import UserVenues from "components/pages/userVenues";
const UserVenuesPage = connect(mapStateToProps, mapDispatchToProps)(UserVenues);

import Validate from "components/pages/validate";
const ValidatePage = connect(mapStateToProps, mapDispatchToProps)(Validate);

import VenueForm from "components/pages/venueForm";
const VenueFormPage = connect(mapStateToProps, mapDispatchToProps)(VenueForm);

import Login from "components/partials/login";
const LoginModal = connect(mapStateToProps, mapDispatchToProps)(Login);

import SiteMenu from "components/partials/siteMenu";
const SiteMenuComponent = connect(mapStateToProps, mapDispatchToProps)(SiteMenu);

import Error404 from "components/status/404";
const NotFoundPage = connect(mapStateToProps, mapDispatchToProps)(Error404);

render(
	<Provider store={store}>
		<SiteRouter />
	</Provider>,
	document.getElementById("root"));
