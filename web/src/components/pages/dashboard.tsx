import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { logout } from "components/lib/auth";

interface IDashboardState {
	path: string;
	userId: number;
}

export default class Dashboard extends React.Component<IProps> {

	mounted = false;

	state: IDashboardState = {
		path: null,
		userId: null,
	};

	constructor(props: IProps) {
		super(props);

		this.logout = this.logout.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);
		this.mounted = true;

	}

	componentWillUnmount() {

		this.mounted = false;

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			if (this.mounted) {
				this.setState({
					path: window.location.pathname,
					userId: this.props.loggedInUserId,
				});
			}

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
						<Link to="/dashboard/events">Edit/Add Events</Link>
					</li>

					<li>
						<Link to="/dashboard/venues">Edit/Add Venues</Link>
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

		logout(this.props.apiLocation, this.props.clearUserInfo, this.props.history, event);

	}

}
