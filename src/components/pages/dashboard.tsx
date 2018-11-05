import React from "react";
import { Link } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import * as auth from "components/lib/auth";

export default class Dashboard<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			path: "",
			userId: "",
		};

		this.logout = this.logout.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path

			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

		}

	}

	render() {

		return (

			<div className="dashboard">

				<div className="buttonRow cornerButton">
					<button type="button" onClick={this.logout} className="largeButton">Log out</button>
				</div>

				<h1>Dashboard</h1>

				<h2>Hi, {this.props.loggedInUserName}!</h2>

				<p>Welcome to your dashboard.  Please choose a function from the list below:</p>

				<ul className="dashboardMenu">

					<li>
						<Link to="/dashboard/account">Your Account</Link>
					</li>

					<li>
						<Link to="/dashboard/events">Your Events</Link>

						{this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1 ?

							<React.Fragment> (<Link to="/dashboard/events/all">All Events</Link>)
							</React.Fragment>

						: " "}

					</li>

					<li>
						<Link to="/dashboard/venues">Your Venues</Link>

						{this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1 ?

							<React.Fragment> (<Link to="/dashboard/venues/all">All Venues</Link>)
							</React.Fragment>

						: " "}

					</li>

					{this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1 ?

						<li>
							<Link to="/dashboard/events/changes">Review Event Changes</Link>
						</li>

					: " "}

					{this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1 ?

						<li>
							<Link to="/dashboard/venues/changes">Review Venue Changes</Link>
						</li>

					: " "}

					{this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("admin") > -1 ?

						<li>
							<Link to="/dashboard/admin">User Admin</Link>
						</li>

					: " "}

				</ul>

			</div>

		);

	}

	logout(event: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

}
