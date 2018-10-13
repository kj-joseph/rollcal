import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, NavLink, Switch, withRouter } from "react-router-dom";

import { Provider, connect } from "react-redux";
import store from "redux/store";
import * as reduxActions from "redux/actions";
import { Dispatch } from "redux";

import axios from "axios";

import "styles/main.scss";
import "flag-icon-css/sass/flag-icon.scss";
import "react-dates/lib/css/_datepicker.css";
import "react-select/dist/react-select.css";

import ".htaccess";
require.context("images/favicon", true);

import HeaderLogo from "images/header-logo.svg";
require.context("images/derbytypes", true);
require.context("images/sanctions", true);
require.context("images/tracks", true);

import MenuFaq from "images/menu/faq.svg";
import MenuSearch from "images/menu/search.svg";
import MenuContact from "images/menu/contact.svg";
import MenuLogin from "images/menu/login.svg";
import MenuLogout from "images/menu/logout.svg";
import MenuProfile from "images/menu/profile.svg";
import MenuEdit from "images/menu/edit.svg";

import MenuDrawer from "images/menu/drawer.svg";

import Error404 from "pages/404";
import Events from "pages/events";
import Search from "pages/search";
import EventDetails from "pages/eventDetails";
import Faq from "pages/faq";
import Validate from "pages/validate";

import Login from "pages/login";

class SiteLogo extends React.Component {

	render () {
		return (
			<img src={HeaderLogo} />
		)
	};

}

class ConnectedSiteRouter extends React.Component<ReduxStore> {

	constructor(props: ReduxStore) {
		super(props);
	}

	render() {

		return (
			<Router>
				<div id="pageWrapper" className={typeof(process.env.ENV) !== "undefined" ? "env-" + process.env.ENV: ""}>
					<LoginBox />
					<div id="siteHeader">
						<div id="siteLogo">
							<SiteLogo />
						</div>
						<div id="siteMenuHeader">
							<SiteMenu />
						</div>
					</div>
					<div id="siteMenuDrawer" className= {this.props.menuDrawerOpen ? " drawerOpen" : "drawerClosed"}>
						<div className="openDrawerIcon" title="Open site menu" onClick={function() {this.props.setMenuState(!this.props.menuDrawerOpen)}}>
							<img src={MenuDrawer} alt="" />
						</div>
						<SiteMenu />
					</div>

					<div id="content">
						{this.props.menuDrawerOpen}
						<Switch>
							<Route exact path="/" component={RedirectHome} />
							<Route path="/events/details/:eventId?" component={EventDetailsPage} />
							<Route path="/events/search" component={SearchPage} />
							<Route path="/events/:startDate?/:endDate?" component={EventsPage} />
							<Route path="/faq" component={FaqPage} />
							<Route path="/validate/:validationCode" component={ValidatePage} />
							<Route component={NotFoundPage} />
						</Switch>
					</div>

				</div>
			</Router>
		);
	};

}

class ConnectedSiteMenu extends React.Component<ReduxStore> {

	constructor(props: ReduxStore) {
		super(props);

		this.logout = this.logout.bind(this);
		this.openLoginBox = this.openLoginBox.bind(this);

		if (sessionStorage.rollCalUserId
			&& sessionStorage.rollCalUserName
			&& sessionStorage.rollCalUserIsAdmin
			&& sessionStorage.rollCalUserSessionId) {

			axios.post(this.props.apiLocation + "auth/checkSession", {
				userId: sessionStorage.rollCalUserId,
				isAdmin: sessionStorage.rollCalUserIsAdmin,
				sessionId: sessionStorage.rollCalUserSessionId
			}).then((results) => {
				if (results.data.response) {
					this.props.setUserInfo({
						loggedIn: true,
						loggedInUserId: sessionStorage.rollCalUserId,
						loggedInUserAdmin: sessionStorage.rollCalUserIsAdmin
					});

				} else {
					this.logout();
				}
			});
			
		}

	}

	logout(event?: React.MouseEvent<HTMLAnchorElement>): void {
		console.log(this);
		if (event) {
			event.preventDefault();
		}

		axios.delete(this.props.apiLocation + "auth/logout/" + sessionStorage.rollCalUserId);	

		sessionStorage.removeItem("rollCalUserId");
		sessionStorage.removeItem("rollCalUserName");
		sessionStorage.removeItem("rollCalUserIsAdmin");
		sessionStorage.removeItem("rollCalUserSessionId");

		this.props.setUserInfo({
			loggedIn: false,
			loggedInUserId: "",
			loggedInUserAdmin: ""
		});
	}

	openLoginBox(event: React.MouseEvent<HTMLAnchorElement>): void {
		event.preventDefault();
		this.props.setLoginBoxState(true);
		this.props.setMenuState(false);
	}

	render() {

		return (
			<div className="siteMenu">
				<ul>
					<li>
						<NavLink to="/events/search" title="Search Events">
							<img src={MenuSearch} alt="" />
						</NavLink>
					</li>
					<li>
						<NavLink exact to="/faq" title="Frequently Asked Questions">
							<img src={MenuFaq} alt="" />
						</NavLink>
					</li>
					<li>
						<NavLink exact to="/contact" title="Contact">
							<img src={MenuContact} alt="" />
						</NavLink>
					</li>
					{ this.props.loggedIn ? 
					<React.Fragment>
						<li>
							<a href="" onClick={this.logout} title="Log out">
								<img src={MenuLogout} alt="" />
							</a>
						</li>
						<li>
							<NavLink to="/profile" title="Profile">
								<img src={MenuProfile} alt="" />
							</NavLink>
						</li>
						<li>
							<NavLink to="/edit" title="Edit">
								<img src={MenuEdit} alt="" />
							</NavLink>
						</li>
					</React.Fragment>
					:
					<React.Fragment>
						<li>
							<a href="" onClick={this.openLoginBox} title="Login / Register">
								<img src={MenuLogin} alt="" />
							</a>
						</li>
					</React.Fragment>
					}
				</ul>
			</div>
		)

	}

}

const RedirectHome = withRouter(({ history }) => {
	history.push("/events");
	return null;
});

const mapStateToProps = (state: ReduxStore) => {
	return {
		apiLocation: state.apiLocation,
		page: state.page,
		lastSearch: state.lastSearch,
		loggedIn: state.loggedIn,
		menuDrawerOpen: state.menuDrawerOpen,
		loginBoxOpen: state.loginBoxOpen
	};
};

const mapDispatchToProps = (dispatch: Dispatch<ActionType>): ReduxActions => {
	return {
		changePage: (page: string) => dispatch(reduxActions.changePage(page)),
		saveSearch: (search: string) => dispatch(reduxActions.saveSearch(search)),
		setMenuState: (menuState: boolean) => dispatch(reduxActions.setMenuState(menuState)),
		setLoginBoxState: (loginBoxState: boolean) => dispatch(reduxActions.setLoginBoxState(loginBoxState)),
		setUserInfo: (userState: UserInfo) => dispatch(reduxActions.setUserInfo(userState))
	};
};

const SiteRouter = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteRouter);
const SiteMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedSiteMenu);
const EventsPage = connect(mapStateToProps, mapDispatchToProps)(Events);
const SearchPage = connect(mapStateToProps, mapDispatchToProps)(Search);
const EventDetailsPage = connect(mapStateToProps, mapDispatchToProps)(EventDetails);
const FaqPage = connect(mapStateToProps, mapDispatchToProps)(Faq);
const NotFoundPage = connect(mapStateToProps, mapDispatchToProps)(Error404);

const ValidatePage = connect(mapStateToProps, mapDispatchToProps)(Validate);

const LoginBox = connect(mapStateToProps, mapDispatchToProps)(Login);

ReactDOM.render(
	<Provider store={store}>
		<SiteRouter />
	</Provider>,
	document.getElementById("root")
);
