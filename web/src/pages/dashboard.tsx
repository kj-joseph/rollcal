import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { checkUserRole, logout } from "services/userService";

interface IDashboardState {
	path: string;
	userId: number;
}

export default class Dashboard extends React.Component<IProps> {

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

		this.props.setPageTitle({
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path
			|| this.props.user.id !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.user.id,
			});

		}

	}

	render() {

		return (

			<div className="dashboard mainDashboard">

				<div className="buttonRow cornerButton">
					<button type="button" onClick={this.logout} className="largeButton">Log out</button>
				</div>

				<h1>Dashboard</h1>

				<h2>Hi, {this.props.user.name}!</h2>

				<p>Welcome to your dashboard.  Please choose a function from the list below:</p>

				<ul className="dashboardMenu">

					<li>
						<Link to="/dashboard/account">Your Account</Link>
					</li>

					<li className="separatorBefore">
						<Link to="/dashboard/events/add">Add New Event</Link>
					</li>

					<li>
						<Link to="/dashboard/events">Edit Events</Link>
					</li>

					<li className="separatorBefore">
						<Link to="/dashboard/venues/add">Add New Venue</Link>
					</li>

					<li>
						<Link to="/dashboard/venues">Edit Venues</Link>
					</li>

					{this.props.user.roles && this.props.user.roles.indexOf("reviewer") > -1 ?

						<li className="separatorBefore">
							<Link to="/dashboard/events/changes">Review Event Changes</Link>
						</li>

					: null}

					{this.props.user.roles && this.props.user.roles.indexOf("reviewer") > -1 ?

						<li>
							<Link to="/dashboard/venues/changes">Review Venue Changes</Link>
						</li>

					: null}

					{this.props.user.roles && this.props.user.roles.indexOf("admin") > -1 ?

						<li className="separatorBefore">
							<Link to="/dashboard/admin">User Admin</Link>
						</li>

					: null}

				</ul>

			</div>

		);

	}

	logout(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();
		logout();

	}

}
