import React from "react";
import { render } from "react-dom";
import { NavLink, Route, Router, Switch } from "react-router-dom";
import ReactSVG from "react-svg";

import { IProps } from "interfaces/redux";
import { Provider } from "react-redux";
import { connectClass } from "redux/connect";
import store from "redux/store";

import history from "components/history";
import { checkLoginStatus } from "services/userService";

import Analytics from "react-ga";
Analytics.initialize("UA-2467744-6");

// Use bluebird
import * as Promise from "bluebird";
Promise.config({
	cancellation: true,
	warnings: false,
});
global.Promise = Promise;

// load css for modules
import "flag-icon-css/sass/flag-icon.scss";
import "react-dates/lib/css/_datepicker.css";

// load site css
import "styles/main.scss";

// load static files
import "static/.htaccess";
require.context("images/favicon", true);
import "static/robots.txt";

// load feature images
require.context("images/derbytypes", true);
require.context("images/sanctions", true);
require.context("images/tracks", true);

// load image referenced by emails
import "images/header-logo.png";

// load header images
import HeaderLogo from "images/header-logo.svg";
import LoginIconSolid from "images/menu/user-circle-solid.svg";
import LoginIconOutline from "images/menu/user-circle.svg";

interface ISiteState {
    url: string;
}

class AppRouter extends React.Component < IProps > {

    state: ISiteState = {
        url: null,
    };

    constructor(props: IProps) {
        super(props);

        this.openLoginModal = this.openLoginModal.bind(this);
    }

    componentDidMount() {

        if (!this.props.sessionInitialized) {

            checkLoginStatus()
            	.then(() => {

                	this.props.setSessionState(true);

            	})
            	.catch(() => {

            		// allow the page to continue if the status cannot be verified
                	this.props.setSessionState(true);

            	});

        }

    }

    componentDidUpdate() {
        if (window.location.pathname !== this.state.url) {

            this.setState({
                url: window.location.pathname,
            });

            if (!!(window.location.pathname.match(/^\/(?:[0-9]{4}-[0-9]{2}-[0-9]{2}|derbytypes|sanctions|tracks|locations)/g))) {

                const urlSearchParts = window.location.pathname.split("/");

                const searchURL: string[] = [];
                let hasStart = false;

                for (const part of urlSearchParts) {

                    if (part.match(/^[0-9]/)) {

                        if (hasStart) {
                            searchURL.push(`endDate=${part}`);
                        } else {
                            searchURL.push(`startDate=${part}`);
                            hasStart = true;
                        }

                    } else if (part) {

                        const values = part.match(/^(derbytypes|sanctions|tracks|locations)\(([^\)]+)\)/);
                        searchURL.push(`${values[1]}=${values[2]}`);

                    }

                }

                Analytics.set({
                    location: `${window.location.origin}/searchResults?${searchURL.join("&")}`,
                });
                Analytics.pageview(`/searchResults?${searchURL.join("&")}`);

            } else {

                Analytics.set({
                    location: window.location.origin + window.location.pathname,
                });
                Analytics.pageview(window.location.pathname);

            }


        }
    }

    openLoginModal(event?: React.MouseEvent < HTMLAnchorElement > ) {

        if (event) {
            event.preventDefault();
        }

        this.props.setLoginModalState(true);
        Analytics.modalview("Login");

    }

    render() {

        return (

            <Router history={history}>

				<div id="pageWrapper">
					<div id="siteHeader">
						<NavLink to="/" title="Roll-Cal.com">
							<ReactSVG id="siteLogo" src={HeaderLogo} />
						</NavLink>
						<div id="siteMenuHeader">
							<SiteMenuComponent />
						</div>
						<div id="loginUserIconMobile">
							{this.props.sessionInitialized ?
								(this.props.loggedIn ?
									<NavLink to="/dashboard" title="Dashboard" activeClassName="activeIcon">
										<ReactSVG src={LoginIconSolid} />
									</NavLink>
								:
									<a href="" onClick={this.openLoginModal} title="Login / Register">
										<ReactSVG src={LoginIconOutline} />
									</a>
								)
							: null}
						</div>
					</div>
					<div id="siteMenuMobile">
						<SiteMenuComponent />
					</div>
					<div id="content">
						{ this.props.sessionInitialized ?
							<Switch>
								<Route path="/validate/:validationCode" component={ValidatePage} exact={true} />
								<Route path="/forgotPassword/:validationCode" component={ForgotPasswordPage} exact={true} />
								<Route path="/event/:eventId?" component={EventDetailsPage} exact={true} />
								<Route path="/dashboard/events/:operation(add|edit)/:eventId(\d+)?" component={EventFormPage} exact={true} />
								<Route path="/dashboard/venues/:operation(add|edit)/:venueId(\d+)?" component={VenueFormPage} exact={true} />
								<Route path="/dashboard/events/changes/:changeId(\d+)" component={ReviewEventChangePage} exact={true} />
								<Route path="/dashboard/events/changes" component={EventChangesPage} exact={true} />
								<Route path="/dashboard/venues/changes/:changeId(\d+)" component={ReviewVenueChangePage} exact={true} />
								<Route path="/dashboard/venues/changes" component={VenueChangesPage} exact={true} />
								<Route path="/dashboard/events/:all(all)?" component={UserEventsPage} exact={true} />
								<Route path="/dashboard/venues/:all(all)?" component={UserVenuesPage} exact={true} />
								<Route path="/dashboard/account" component={UserAccountPage} exact={true} />
								<Route path="/dashboard/admin/user/:id" component={EditUserPage} exact={true} />
								<Route path="/dashboard/admin" component={AdminDashboardPage} exact={true} />
								<Route path="/dashboard" component={DashboardPage} exact={true} />
								<Route path="/search" component={SearchPage} exact={true} />
								<Route path="/faq" component={FaqPage} exact={true} />
								<Route path="/contact" component={ContactPage} exact={true} />
								<Route
									path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(locations.*)"
									component={EventsPage}
								/>
								<Route
									path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:endDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(distance.*)"
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
									path="/:startDate([0-9]{4}-[0-9]{2}-[0-9]{2})/:param1(distance.*)"
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
									path="/:param1(distance.*)"
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

			 </Router>

        );
    }

}

const SiteRouter = connectClass(AppRouter);

import AdminDashboard from "pages/admin";
const AdminDashboardPage = connectClass(AdminDashboard);

import Contact from "pages/contact";
const ContactPage = connectClass(Contact);

import Dashboard from "pages/dashboard";
const DashboardPage = connectClass(Dashboard);

import EditUser from "pages/editUser";
const EditUserPage = connectClass(EditUser);

import EventDetails from "pages/eventDetails";
const EventDetailsPage = connectClass(EventDetails);

import EventChanges from "pages/eventChanges";
const EventChangesPage = connectClass(EventChanges);

import EventForm from "pages/eventForm";
const EventFormPage = connectClass(EventForm);

import Events from "pages/events";
const EventsPage = connectClass(Events);

import Faq from "pages/faq";
const FaqPage = connectClass(Faq);

import ForgotPassword from "pages/forgotPassword";
const ForgotPasswordPage = connectClass(ForgotPassword);

import ReviewEventChange from "pages/reviewEventChange";
const ReviewEventChangePage = connectClass(ReviewEventChange);

import ReviewVenueChange from "pages/reviewVenueChange";
const ReviewVenueChangePage = connectClass(ReviewVenueChange);

import Search from "pages/search";
const SearchPage = connectClass(Search);

import UserAccount from "pages/userAccount";
const UserAccountPage = connectClass(UserAccount);

import UserEvents from "pages/userEvents";
const UserEventsPage = connectClass(UserEvents);

import UserVenues from "pages/userVenues";
const UserVenuesPage = connectClass(UserVenues);

import Validate from "pages/validate";
const ValidatePage = connectClass(Validate);

import VenueChanges from "pages/venueChanges";
const VenueChangesPage = connectClass(VenueChanges);

import VenueForm from "pages/venueForm";
const VenueFormPage = connectClass(VenueForm);

import Login from "components/login";
const LoginModal = connectClass(Login);

import SiteMenu from "components/siteMenu";
const SiteMenuComponent = connectClass(SiteMenu);

import Error404 from "status/404";
const NotFoundPage = connectClass(Error404);

render(
    <Provider store={store}>
		<SiteRouter />
	</Provider>,
    document.getElementById("root"));
