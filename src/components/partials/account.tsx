import React from "react";
import { withRouter } from "react-router";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import axios, { AxiosError, AxiosResponse } from "axios";

import * as auth from "components/lib/auth";

class Account<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			accountCurrentPassword: "",
			accountEmail: "",
			accountId: "",
			accountNewPassword: "",
			accountNewPasswordConfirm: "",
			accountUsername: "",
			errorMessage: "",
			formValid: false,
			initialAccountEmail: "",
			initialAccountId: "",
			initialAccountUsername: "",
			isOpen: false,
			modalStatus: "form",
			processing: false,
		};

		this.clearState = this.clearState.bind(this);
		this.closeAccountModal = this.closeAccountModal.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitAccountForm = this.submitAccountForm.bind(this);

	}

	componentDidUpdate() {

		if (this.props.accountModalOpen !== this.state.isOpen) {

			this.setState({
				accountCurrentPassword: "",
				accountEmail: this.props.loggedInUserEmail,
				accountId: this.props.loggedInUserId,
				accountNewPassword: "",
				accountNewPasswordConfirm: "",
				accountUsername: this.props.loggedInUserName,
				initialAccountEmail: this.props.loggedInUserEmail,
				initialAccountId: this.props.loggedInUserId,
				initialAccountUsername: this.props.loggedInUserName,
				isOpen: this.props.accountModalOpen,
				processing: false,
			});

		}
	}

	render() {

		let formValid = false;

		if (this.props.accountModalOpen && document.getElementById("accountForm")) {
			formValid = this.checkFormValidity();
		}

		return (

			<Modal
				isOpen={this.props.accountModalOpen}
				onRequestClose={this.closeAccountModal}
				contentLabel="Example Modal"
				className="accountModal"
				overlayClassName="modalOverlay"
			>

				<div id="AccountModal">

					<ReactSVG
						className="modalClose"
						title="close"
						src={CloseIcon}
						onClick={this.closeAccountModal}
					/>

					{this.state.modalStatus === "form" ?

						<form
							id="accountForm"
							onSubmit={this.submitAccountForm}
							className={this.state.processing ? " disabled" : ""}
						>

							<h2>Account Details</h2>

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
								<label htmlFor="accountCurrentPassword">Verify current password (if changing email or password)</label>
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

							<p className="formError">{this.state.errorMessage}</p>

							<div className="buttonRow">
								<button type="submit" disabled={!formValid || this.state.processing} className="largeButton">Save</button>
							</div>

							<div className="formFooter">
								<p>
									<strong>NOTE:</strong>
									If you change your email address, you will be logged out and will need to re-validate your account.
									Check your email for a validation link after submitting the form.
								</p>
							</div>

						</form>

					: this.state.modalStatus === "register" ?

						<div className="buttonRow">
							<button
								type="submit"
								disabled={!formValid}
								className="largeButton"
							>
								Register
							</button>
						</div>

					: this.state.modalStatus === "regComplete" ?

					<div className="registrationComplete">

						<p>Your registration has been submitted.
							An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

						<div className="buttonRow">
							<button type="button" onClick={this.closeAccountModal} disabled={this.state.processing} className="largeButton">Close</button>
						</div>

					</div>

					: "" }

					{ this.state.processing ?
						<div className={"loader medium" + (this.state.processing ? "" : " disabled")} />
					: "" }

				</div>

			</Modal>

		);

	}

	closeAccountModal(event?: React.MouseEvent<any>) {

		if (event) {
			event.preventDefault();
		}

		this.clearState();
		this.props.setAccountModalState(false);

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
				},
				{ withCredentials: true })
			.then((result: AxiosResponse) => {

				if (result.data.validationCode) {

					this.logout();
					this.closeAccountModal();

				} else {

					this.clearState();

					this.props.setUserInfo({
						loggedIn: true,
						userEmail: result.data.email,
						userId: result.data.id,
						userName: result.data.username,
						userRoles: result.data.roles,
					});

					this.closeAccountModal();
				}

			}).catch((error: AxiosError) => {
				console.error(error);
				this.setState({
					errorMessage: "Sorry, something went wrong.  Your current password may not have been correct.  Please try again.",
					processing: false,
				});
			});

		}
	}

	clearState() {

		this.state = {
			accountCurrentPassword: "",
			accountEmail: "",
			accountId: "",
			accountNewPassword: "",
			accountNewPasswordConfirm: "",
			accountUsername: "",
			errorMessage: "",
			formValid: false,
			initialAccountEmail: "",
			initialAccountId: "",
			initialAccountUsername: "",
			isOpen: false,
			modalStatus: "form",
			processing: false,
		};

	}

	logout(event?: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

}

export default withRouter(Account);
