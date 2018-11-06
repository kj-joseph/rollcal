import React from "react";
import { Link } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import * as auth from "components/lib/auth";

export default class UserAccount<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			accountCurrentPassword: "",
			accountEmail: this.props.loggedInUserEmail,
			accountId: this.props.loggedInUserId,
			accountNewPassword: "",
			accountNewPasswordConfirm: "",
			accountUsername: this.props.loggedInUserName,
			error: null,
			initialAccountEmail: this.props.loggedInUserEmail,
			initialAccountId: this.props.loggedInUserId,
			initialAccountUsername: this.props.loggedInUserName,
			path: window.location.pathname,
			processing: false,
			status: "form",
		};

		if (!this.props.loggedIn && this.state.status !== "successLogout") {

			this.props.history.push("/");

		}

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitAccountForm = this.submitAccountForm.bind(this);

	}

	render() {

		let formValid = false;

		if (document.getElementById("accountForm")) {
			formValid = this.checkFormValidity();
		}

		return (

			<React.Fragment>

				{this.state.loading || this.state.processing ?

					<div className="loader" />

				:

					<React.Fragment>

						{this.state.status !== "successLogout" ?

							<p className="backToLink">
								<Link to="/dashboard">
									&laquo; Back to dashboard
								</Link>
							</p>

						: ""}

						<div className="userAccount">

							<h1>Your Account</h1>

							{this.state.status === "form" ?

								<React.Fragment>

									<form
										id="accountForm"
										onSubmit={this.submitAccountForm}
										className={this.state.processing ? " disabled" : ""}
									>

										<div className="inputGroup">
											<label htmlFor="accountEmail">Email address</label>
											<input
												id="accountEmail"
												name="accountEmail"
												type="email"
												required={true}
												disabled={this.state.processing}
												value={this.state.accountEmail}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountUsername">Display name (2+ characters)</label>
											<input
												id="accountUsername"
												name="accountUsername"
												type="text"
												required={true}
												title="Must start with a letter; only letters, numbers, -, _, and ."
												pattern="[A-Za-z][A-Za-z0-9-_\.]+"
												disabled={this.state.processing}
												value={this.state.accountUsername}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountNewPassword">New password (8+ characters)</label>
											<input
												id="accountNewPassword"
												name="accountNewPassword"
												type="password"
												required={false}
												disabled={this.state.processing}
												value={this.state.accountNewPassword}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountNewPasswordConfirm">Confirm new password</label>
											<input
												id="accountNewPasswordConfirm"
												name="accountNewPasswordConfirm"
												type="password"
												required={!!this.state.accountNewPassword}
												pattern=".{8}.*"
												disabled={this.state.processing || !this.state.accountNewPassword}
												value={this.state.accountNewPasswordConfirm}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountCurrentPassword">Verify current password<br /><em>(if changing email or password)</em></label>
											<input
												id="accountCurrentPassword"
												name="accountCurrentPassword"
												type="password"
												required={this.state.accountEmail !== this.state.initialAccountEmail
													|| !!this.state.accountNewPassword}
												disabled={this.state.processing ||
													!(this.state.accountEmail !== this.state.initialAccountEmail
														|| !!this.state.accountNewPassword)}
												value={this.state.accountCurrentPassword}
												onChange={this.handleInputChange}
											/>
										</div>

										<p className="formError">{this.state.error}</p>

										<div className="buttonRow">
											<button type="submit" disabled={!formValid || this.state.processing} className="largeButton">Save</button>
										</div>

									</form>

								</React.Fragment>

							: this.state.status === "success" || this.state.status === "successLogout" ?

								<React.Fragment>

									<p>Your account changes were successful!</p>

									{ this.state.status === "successLogout" ?

										<p>Since you changed your email address, you have been logged out.
											An email has been sent to your new address in order to confirm your account.</p>

									: ""}

								</React.Fragment>

							: ""}

						</div>

					</React.Fragment>

				}

			</React.Fragment>

		);

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
		});

	}

	checkFormValidity() {

		const formValidates = (document.getElementById("accountForm") as HTMLFormElement).checkValidity();

		const hasChanges = this.state.accountEmail !== this.state.initialAccountEmail
				|| this.state.accountUsername !== this.state.initialAccountUsername
				|| !!this.state.accountNewPassword;

		const needsPassword = ((this.state.accountEmail !== this.state.initialAccountEmail)
				|| !!this.state.accountNewPassword);

		const passwordOk = !needsPassword || !!this.state.accountCurrentPassword;

		const newPasswordsMatch = !this.state.accountNewPassword
			|| this.state.accountNewPassword === this.state.accountNewPasswordConfirm;

		return formValidates && hasChanges && passwordOk && newPasswordsMatch;
	}

	submitAccountForm(event: React.MouseEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!!this.state.accountNewPassword && this.state.accountNewPassword !== this.state.accountNewPasswordConfirm) {
			this.setState({
				errorMessage: "The new passwords need to match.",
				processing: false,
			});

		} else {

			this.setState({
				processing: true,
			});

			axios.put(this.props.apiLocation + "user/account/update", {
				currentPassword: this.state.accountCurrentPassword,
				email: this.state.accountEmail !== this.state.initialAccountEmail
					&& !!this.state.accountCurrentPassword
					? this.state.accountEmail : "",
				id: this.props.loggedInUserId,
				newPassword: this.state.accountNewPassword === this.state.accountNewPasswordConfirm
					&& !!this.state.accountCurrentPassword
					? this.state.accountNewPassword : "",
				username: this.state.accountUsername !== this.state.initialAccountUsername
					? this.state.accountUsername : "",
				}, { withCredentials: true })
			.then((result: AxiosResponse) => {

				if (result.data.validationCode) {

					this.setState({
						processing: false,
						status: "successLogout",
					});

					this.logout();

				} else {

					this.setState({
						processing: false,
						status: "success",
					});

					this.props.setUserInfo({
						loggedIn: true,
						userEmail: result.data.email,
						userId: result.data.id,
						userName: result.data.username,
						userRoles: result.data.roles,
					});

				}

			}).catch((error: AxiosError) => {
				console.error(error);
				this.setState({
					error: "Sorry, something went wrong.  Your current password may not have been correct.  Please try again.",
					processing: false,
				});
			});

		}
	}

	logout(event?: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event, false);

	}

}