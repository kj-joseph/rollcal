import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";
import { IDBUserInfo, IUserInfo } from "interfaces/user";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { checkUserRole } from "services/user";

import axios from "axios";

interface IAdminDashboardState {
	path: string;
	searchComplete: boolean;
	searchError: boolean;
	searchResults: IUserInfo[];
	searchTerm: string;
	searching: boolean;
	userId: number;
}

export default class AdminDashboard extends React.Component<IProps> {

	axiosSignal = axios.CancelToken.source();

	state: IAdminDashboardState = {
		path: null,
		searchComplete: false,
		searchError: false,
		searchResults: [],
		searchTerm: "",
		searching: false,
		userId: null,
	};

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Admin Dashboard",
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole(this.props.loggedInUserRoles, "user")) {

			this.props.history.push("/");

		} else if (!checkUserRole(this.props.loggedInUserRoles, "admin")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

		}

	}

	componentWillUnmount() {
		this.axiosSignal.cancel();
	}

	render() {

		return (

			<React.Fragment>

				<p className="backToLink">
					<Link to="/dashboard">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div className="dashboard admin">

					<h1>Admin Dashboard</h1>

					<form
						id="userSearchForm"
						onSubmit={this.submitSearch}
					>

						<div className="inputGroup">
							<label htmlFor="searchTerm">Search Users</label>
							<input
								id="searchTerm"
								name="searchTerm"
								type="text"
								pattern=".{2}.*"
								required={true}
								value={this.state.searchTerm}
								onChange={this.handleInputChange}
							/>
						</div>

						<div className="buttonRow">
							<button
								className="largeButton"
								type="submit"
								disabled={this.state.searchTerm.length < 2}
							>
								Search
							</button>
						</div>

					</form>

					{this.state.searchComplete ?

						this.state.searchResults.length ?

							<table className="userTable">

								<thead>
									<tr>
										<th>Name</th>
										<th>Email</th>
										<th>Status</th>
									</tr>
								</thead>

								<tbody>
									{this.state.searchResults.map((user) => (
										<tr key={user.userId}>
											<td>
												{ user.userId === this.props.loggedInUserId
													|| (checkUserRole(user.userRoles, "admin")
														&& !checkUserRole(this.props.loggedInUserRoles, "superadmin")) ?
													user.userName
												:
													<Link to={`/dashboard/admin/user/${user.userId}`}>{user.userName}</Link>
												}
											</td>
											<td>
												{user.userEmail}
											</td>
											<td>
												{user.userStatus}
											</td>
										</tr>
									))}


								</tbody>

							</table>

						:

							<p>No matches found.</p>

					: this.state.searchError ?

						<p className="error">There was an error.  Please try again.</p>

					: this.state.searching ?

						<div className="loader medium" />

					: ""}


				</div>

			</React.Fragment>

		);

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		this.setState({
			searchTerm: event.currentTarget.value,
		});

	}

	submitSearch(event: React.MouseEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			searchComplete: false,
			searching: true,
		});

		axios.get(`${this.props.apiLocation}admin/searchUsers/${this.state.searchTerm}`,
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					searchComplete: true,
					searchResults: result.data.map((user: IDBUserInfo): IUserInfo => ({
						userEmail: user.user_email,
						userId: user.user_id,
						userName: user.user_name,
						userRoles: user.user_roles,
						userStatus: user.user_status,
					})),
					searching: false,
				});

			}).catch((error) => {

				if (!axios.isCancel(error)) {
					console.error(error);
					this.setState({
						searchComplete: false,
						searchError: true,
						searching: false,
					});
				}

			});

	}
}
