import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Route,
	NavLink,
	Switch,
	withRouter 
} from "react-router-dom";

import { Provider } from "react-redux";
import store from "redux/store/index";
import { connect } from "react-redux";
import { 
	changePage,
	saveSearch,
	setMenuState,
	setLoginBoxState,
	setUserInfo
} from "redux/actions/index";

import axios from "axios";

import "styles/main.scss";
import flagIconCss from "flag_icon_css";
import "react-dates/lib/css/_datepicker.css";
import "react-select/dist/react-select.css";

import HeaderLogo from "images/header-logo.svg";
import HeaderLogoPNG from "images/header-logo.png";
import htaccess from ".htaccess";
const favicons = require.context("images/favicon", true);

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

import Error404 from "pages/404.jsx";
import Events from "pages/events.jsx";
import Search from "pages/search.jsx";
import EventDetails from "pages/eventDetails.jsx";
import Faq from "pages/faq.jsx";
import Validate from "pages/validate.jsx";

import Login from "pages/login.jsx";


class SiteLogo extends React.Component {

	render () {
		return (
			<img src={HeaderLogo} />
		)
	};

}

class ConnectedSiteRouter extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<Router>
				<div id="pageWrapper" className={ENV ? "env-" + ENV: ""}>
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
						<div className="openDrawerIcon" title="Open site menu" onClick={() => {this.props.setMenuState(!this.props.menuDrawerOpen)}}>
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

class ConnectedSiteMenu extends React.Component {

	constructor(props) {
		super(props);

		if (sessionStorage.rollCalUserId
			&& sessionStorage.rollCalUserName
			&& sessionStorage.rollCalUserIsAdmin
			&& sessionStorage.rollCalUserSessionId) {

			axios.post(this.props.apiLocation + "auth/checkSession", {
				userId: sessionStorage.rollCalUserId,
				isAdmin: sessionStorage.rollCalUserIsAdmin,
				sessionId: sessionStorage.rollCalUserSessionId
			}).then(results => {
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

		this.openLoginBox = event => {
			event.preventDefault();
			this.props.setLoginBoxState(true);
			this.props.setMenuState(false);
		}

		this.logout = event => {
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

const mapStateToProps = state => {
	return {
		apiLocation: state.apiLocation,
		page: state.page,
		lastSearch: state.lastSearch,
		loggedIn: state.loggedIn,
		menuDrawerOpen: state.menuDrawerOpen,
		loginBoxOpen: state.loginBoxOpen
	};
};

const mapDispatchToProps = dispatch => {
	return {
		changePage: page => dispatch(changePage(page)),
		saveSearch: search => dispatch(saveSearch(search)),
		setMenuState: menuState => dispatch(setMenuState(menuState)),
		setLoginBoxState: loginBoxState => dispatch(setLoginBoxState(loginBoxState)),
		setUserInfo: userState => dispatch(setUserInfo(userState))
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
