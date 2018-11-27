import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";
import { IUserInfo, IUserRole } from "interfaces/user";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { checkUserRole } from "components/lib/auth";
import { getUserRoles } from "components/lib/data";

import axios from "axios";

import Select from "react-select";

interface IUserStatus {
	label: string;
	value: string;
}

interface IAdminDashboardState {
	dataError: boolean;
	editUserEmail: string;
	editUserId: number;
	editUserName: string;
	editUserRoles: IUserRole[];
	editUserStatus: IUserStatus;
	loading: boolean;
	path: string;
	rolesList: IUserRole[];
	saveError: boolean;
	saveSuccess: boolean;
	userId: number;
	userInfo: IUserInfo;
}

export default class EditUser extends React.Component<IProps> {

	axiosSignal = axios.CancelToken.source();

	state: IAdminDashboardState = {
		dataError: false,
		editUserEmail: "",
		editUserId: null,
		editUserName: "",
		editUserRoles: [],
		editUserStatus: {} as IUserStatus,
		loading: true,
		path: null,
		rolesList: [],
		saveError: false,
		saveSuccess: false,
		userId: null,
		userInfo: {} as IUserInfo,
	};

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleRoleChange = this.handleRoleChange.bind(this);
		this.handleStatusChange = this.handleStatusChange.bind(this);
		this.loadData = this.loadData.bind(this);
		this.submitForm = this.submitForm.bind(this);
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

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (!checkUserRole(this.props.loggedInUserRoles, "admin")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			this.loadData();

		}

	}

	componentWillUnmount() {
		this.axiosSignal.cancel();
	}

	render() {

		return (

			<React.Fragment>

				<p className="backToLink">
					<Link to="/dashboard/admin">
						&laquo; Back to admin dashboard
					</Link>
				</p>

				<div className="dashboard editUser">

					<h1>Edit User</h1>

					{ this.state.loading ?

						<div className="loader" />

					: this.state.dataError ?

						<div>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					: this.state.saveSuccess ?

						<div>
							<p>Changes have been saved.</p>
						</div>

					:

						<form
							id="editUserForm"
							onSubmit={this.submitForm}
						>

							<p>User ID: {this.state.editUserId}</p>

							<div className="inputGroup">
								<label htmlFor="editUserName">Display Name</label>
								<input
									id="editUserName"
									name="editUserName"
									type="text"
									pattern=".{2}.*"
									required={true}
									value={this.state.editUserName}
									onChange={this.handleInputChange}
								/>
							</div>

							<div className="inputGroup">
								<label htmlFor="editUserEmail">Email Address</label>
								<input
									id="editUserEmail"
									name="editUserEmail"
									type="email"
									required={true}
									value={this.state.editUserEmail}
									onChange={this.handleInputChange}
								/>
							</div>

							<div className="inputGroup selectStatus">
								<label htmlFor="editUserStatus">Status</label>
								<Select
									id="editUserStatus"
									name="editUserStatus"
									className="Select"
									classNamePrefix="Select"
									value={this.state.editUserStatus}
									onChange={this.handleStatusChange}
									options={this.props.userStatusList.map((status: string) => ({
										label: status,
										value: status,
									}))}
									isSearchable={true}
									isClearable={false}
								/>
							</div>

							<div className="inputGroup selectRoles">
								<label htmlFor="editUserRoles">User Roles</label>
								<Select
									isMulti={true}
									id="editUserRoles"
									name="editUserRoles"
									className="Select"
									classNamePrefix="Select"
									value={this.state.editUserRoles}
									onChange={this.handleRoleChange}
									options={this.state.rolesList}
									getOptionLabel={this.getRoleLabel}
									getOptionValue={this.getRoleValue}
									isSearchable={true}
									isClearable={true}
								/>
							</div>

							<div className="buttonRow">
								{ this.state.saveError ?
									<p className="error">There was an error while saving.  Please try again.</p>
								: ""}
								<button
									className="largeButton"
									type="submit"
									disabled={document.getElementById("editUserForm")
										&& !(document.getElementById("editUserForm") as HTMLFormElement).checkValidity()
									}
								>
									Save
								</button>
							</div>

						</form>

					}

				</div>

			</React.Fragment>

		);

	}

	getRoleLabel = (role: IUserRole) => {
	  return role.name;
	}

	getRoleValue = (role: IUserRole) => {
	  return role.id.toString();
	}

	handleInputChange <T extends keyof IAdminDashboardState>(event: React.ChangeEvent<HTMLInputElement>) {

		const fieldName: (keyof IAdminDashboardState) = event.currentTarget.name as (keyof IAdminDashboardState);
		const newState = ({
			[fieldName]: event.currentTarget.value,
		});
		this.setState(newState as { [P in T]: IAdminDashboardState[P]; });

	}

	handleRoleChange(selected: IUserRole[]) {

		// user role is required
		if (!selected.filter((role) => role.name === "user").length) {
			selected.unshift(this.props.rolesList.filter((role) => role.name === "user")[0]);
		}

		this.setState({
			editUserRoles: selected.sort((a, b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0),
		});

	}

	handleStatusChange(status: IUserStatus) {

		this.setState({
			editUserStatus: status,
		});

	}

	submitForm(event: React.MouseEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			loading: true,
			saveError: false,
		});

		axios.put(`${this.props.apiLocation}admin/updateUser/${this.state.editUserId}`, {
			userEmail: this.state.editUserEmail,
			userName: this.state.editUserName,
			userRoles: this.state.editUserRoles
				.map((role) => role.id).join(","),
			userStatus: this.state.editUserStatus.value,
		},
		{
			cancelToken: this.axiosSignal.token,
			withCredentials: true,
		})
			.then((result) => {

				this.setState({
					loading: false,
					saveSuccess: true,
				});

			}).catch((error) => {

				this.setState({
					loading: false,
					saveError: true,
				});

			});

	}

	loadData() {

		this.setState({
			searchComplete: false,
			searching: true,
		});

		getUserRoles(
			this.props.apiLocation,
			this.props.rolesList,
			this.props.saveRolesList,
			this.axiosSignal)
				.then(() => {

					const rolesList = this.props.rolesList;

					axios.get(`${this.props.apiLocation}admin/getUserDetailsById/${this.props.match.params.id}`,
						{
							cancelToken: this.axiosSignal.token,
							withCredentials: true,
						})
						.then((result) => {

							const userRoles = this.props.rolesList
								.filter((role) => result.data.user_roles.indexOf(role.id.toString()) > -1)
								.sort((a, b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0);

							this.setState({
								editUserEmail: result.data.user_email,
								editUserId: result.data.user_id,
								editUserName: result.data.user_name,
								editUserRoles: userRoles,
								editUserStatus: {
									label: result.data.user_status,
									value: result.data.user_status,
								},
								loading: false,
								rolesList,
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

				});

	}

}
