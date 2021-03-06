import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { checkEmail, checkUsername, logout, updateUserProfile } from "services/userService";

import { IProps } from "interfaces/redux";
import { IUserInfo } from "interfaces/user";

interface IUserAccountState {
	accountCurrentPassword: string;
	accountEmail: string;
	accountEmailChecked: boolean;
	accountEmailChecking: boolean;
	accountEmailError: string;
	accountEmailOk: boolean;
	accountId: number;
	accountNewPassword: string;
	accountNewPasswordConfirm: string;
	accountUsername: string;
	accountUsernameChecked: boolean;
	accountUsernameChecking: boolean;
	accountUsernameError: string;
	accountUsernameOk: boolean;
	errorMessage: string;
	initialAccountEmail: string;
	initialAccountId: number;
	initialAccountUsername: string;
	path: string;
	processing: boolean;
	status: "form" | "success" | "successLogout";
}

export default class UserAccount extends RCComponent<IProps> {

	state: IUserAccountState = {
		accountCurrentPassword: "",
		accountEmail: this.props.user.email,
		accountEmailChecked: false,
		accountEmailChecking: false,
		accountEmailError: null,
		accountEmailOk: true,
		accountId: this.props.user.id,
		accountNewPassword: "",
		accountNewPasswordConfirm: "",
		accountUsername: this.props.user.name,
		accountUsernameChecked: false,
		accountUsernameChecking: false,
		accountUsernameError: null,
		accountUsernameOk: true,
		errorMessage: null,
		initialAccountEmail: this.props.user.email,
		initialAccountId: this.props.user.id,
		initialAccountUsername: this.props.user.name,
		path: window.location.pathname,
		processing: false,
		status: "form",
	};

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitAccountForm = this.submitAccountForm.bind(this);
	}

	componentDidMount() {

		this.props.setPageTitle({
			detail: "Your Account",
			page: "User Dashboard",
		});

	}

	componentWillUpdate() {

		if (!this.props.loggedIn && this.state.status !== "successLogout") {

			this.props.history.push("/");

		}

	}

	render() {

		let formValid = false;

		if (document.getElementById("accountForm")) {
			formValid = this.checkFormValidity();
		}

		return (

			<>

				{this.state.processing ?

					<div className="loader" />

				:

					<>

						{this.state.status !== "successLogout" ?

							<p className="backToLink">
								<Link to="/dashboard">
									&laquo; Back to dashboard
								</Link>
							</p>

						: null}

						<div className="userAccount">

							<h1>Your Account</h1>

							{this.state.status === "form" ?

								<>

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
											<p className="error" id="emailError">{this.state.accountEmailError}</p>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountUsername">Display name (2+ characters, start with letter)</label>
											<input
												id="accountUsername"
												name="accountUsername"
												type="text"
												required={true}
												pattern="[A-Za-z].+"
												disabled={this.state.processing}
												value={this.state.accountUsername}
												onChange={this.handleInputChange}
											/>
											<p className="error" id="emailError">{this.state.accountUsernameError}</p>
										</div>

										<div className="inputGroup">
											<label htmlFor="accountNewPassword">New password (8+ characters)</label>
											<input
												id="accountNewPassword"
												name="accountNewPassword"
												type="password"
												required={false}
												pattern=".{8}.*"
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
												pattern=".{8}.*"
												required={this.state.accountEmail !== this.state.initialAccountEmail
													|| !!this.state.accountNewPassword}
												disabled={this.state.processing ||
													!(this.state.accountEmail !== this.state.initialAccountEmail
														|| !!this.state.accountNewPassword)}
												value={this.state.accountCurrentPassword}
												onChange={this.handleInputChange}
											/>
										</div>

										<p className="formError">{this.state.errorMessage}</p>

										<div className="buttonRow">
											<button type="submit" disabled={!formValid || this.state.processing} className="largeButton">Save</button>
										</div>

									</form>

								</>

							: this.state.status === "success" || this.state.status === "successLogout" ?

								<>

									<p>Your account changes were successful!</p>

									{ this.state.status === "successLogout" ?

										<p>Since you changed your email address, you have been logged out.
											An email has been sent to your new address in order to confirm your account.</p>

									: null}

								</>

							: null}

						</div>

					</>

				}

			</>

		);

	}

	checkFormValidity(): boolean {

		const formValidates = (document.getElementById("accountForm") as HTMLFormElement).checkValidity();

		const fieldsChecked = this.state.accountEmailOk && this.state.accountUsernameOk;

		const hasChanges = this.state.accountEmail !== this.state.initialAccountEmail
				|| this.state.accountUsername !== this.state.initialAccountUsername
				|| !!this.state.accountNewPassword;

		const needsPassword = ((this.state.accountEmail !== this.state.initialAccountEmail)
				|| !!this.state.accountNewPassword);

		const passwordOk = !needsPassword || !!this.state.accountCurrentPassword;

		const newPasswordsMatch = !this.state.accountNewPassword
			|| this.state.accountNewPassword === this.state.accountNewPasswordConfirm;

		return formValidates && fieldsChecked && hasChanges && passwordOk && newPasswordsMatch;
	}

	checkEmail(email: string): void {

		this.setState({
			accountEmailChecking: true,
			accountEmailOk: false,
		});

		const emailCheck = this.addPromise(
			checkEmail(email, this.props.user.id));

		emailCheck
			.then((emailRegistered) => {

				if (emailRegistered) {

					this.setState({
						accountEmailChecked: true,
						accountEmailChecking: false,
						accountEmailError: "That email has already been registered.",
						accountEmailOk: false,
					});

				} else {

					this.setState({
						accountEmailChecked: true,
						accountEmailChecking: false,
						accountEmailError: null,
						accountEmailOk: true,
					});

				}

			}).catch((error) => {

				this.setState({
					accountEmailChecked: true,
					accountEmailChecking: false,
					accountEmailError: "An error occurred.",
					accountEmailOk: false,
				});

			})
			.finally(emailCheck.clear);

	}

	checkUsername(username: string): void {

		this.setState({
			accountUsernameChecking: true,
			accountUsernameOk: false,
		});

		const usernameCheck = this.addPromise(
			checkUsername(username, this.props.user.id));

		usernameCheck
			.then((usernameUsed) => {

				if (usernameUsed) {

					this.setState({
						accountUsernameChecked: true,
						accountUsernameChecking: false,
						accountUsernameError: "That display name is already in use.",
						accountUsernameOk: false,
					});

				} else {

					this.setState({
						accountUsernameChecked: true,
						accountUsernameChecking: false,
						accountUsernameError: null,
						accountUsernameOk: true,
					});

				}

			}).catch((error) => {

				this.setState({
					accountUsernameChecked: true,
					accountUsernameChecking: false,
					accountUsernameError: "An error occurred.",
					accountUsernameOk: false,
				});

			})

			.finally(usernameCheck.clear);

	}

	handleInputChange <T extends keyof IUserAccountState>(event: React.ChangeEvent<HTMLInputElement>): void {

		const fieldName: (keyof IUserAccountState) = event.currentTarget.name as (keyof IUserAccountState);
		const newState = ({
			[fieldName]: event.currentTarget.value,
		});
		this.setState(newState as { [P in T]: IUserAccountState[P]; });

		if (fieldName === "accountUsername") {

			if (event.currentTarget.validity.valid) {

				this.checkUsername(event.currentTarget.value);

			} else {

				this.setState({
					accountUsernameChecked: false,
					accountUsernameChecking: false,
					accountUsernameError: null,
					accountUsernameOk: false,
				});

			}

		} else if (fieldName === "accountEmail") {

			if (event.currentTarget.validity.valid) {

				this.checkEmail(event.currentTarget.value);

			} else {

				this.setState({
					accountEmailChecked: false,
					accountEmailChecking: false,
					accountEmailError: null,
					accountEmailOk: false,
				});

			}

		}

	}

	submitAccountForm(event: React.MouseEvent<HTMLFormElement>): void {
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

			const userUpdate = this.addPromise(
				updateUserProfile(
					this.props.user.id,
					{
						currentPassword: this.state.accountCurrentPassword || undefined,
						email: this.state.accountEmail !== this.state.initialAccountEmail
							&& !!this.state.accountCurrentPassword ?
							this.state.accountEmail : undefined,
						newPassword: this.state.accountNewPassword === this.state.accountNewPasswordConfirm
							&& !!this.state.accountCurrentPassword ?
							this.state.accountNewPassword : undefined,
						username: this.state.accountUsername !== this.state.initialAccountUsername ?
							this.state.accountUsername : undefined,
					},
				));

			userUpdate
				.then((userInfo: IUserInfo) => {

					if (userInfo.validationCode) {

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

						const savedUserInfo = Object.assign(userInfo, {});
						delete savedUserInfo.validationCode;
						this.props.setUserInfo(savedUserInfo);

					}

				}).catch((error) => {

					this.setState({
						errorMessage: "Sorry, something went wrong.  Your current password may not have been correct.  Please try again.",
						processing: false,
					});

				})
				.finally(userUpdate.clear);

		}
	}

	logout(event?: React.MouseEvent<HTMLButtonElement>): void {

		if (event) {
			event.preventDefault();
		}
		logout(false);

	}

}
