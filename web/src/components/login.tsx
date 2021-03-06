import RCComponent from "components/rcComponent";
import React from "react";
import { withRouter } from "react-router";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import { IProps } from "interfaces/redux";
import { IUserInfo } from "interfaces/user";

import { checkEmail, checkUsername, login, registerUser, submitForgotPassword } from "services/userService";

interface ILoginState {
	errorMessage: string;
	forgotEmail: string;
	formValid: boolean;
	loading: boolean;
	loginEmail: string;
	loginPassword: string;
	modalStatus: "forgot" | "forgotSuccess" |  "login" | "register" | "registrationSuccess";
	path: string;
	registerEmail: string;
	registerEmailChecked: boolean;
	registerEmailChecking: boolean;
	registerEmailError: string;
	registerEmailOk: boolean;
	registerPassword: string;
	registerPasswordConfirm: string;
	registerUsername: string;
	registerUsernameChecked: boolean;
	registerUsernameChecking: boolean;
	registerUsernameError: string;
	registerUsernameOk: boolean;
}

class Login extends RCComponent<IProps> {

	state: ILoginState = {
		errorMessage: null,
		forgotEmail: "",
		formValid: false,
		loading: false,
		loginEmail: "",
		loginPassword: "",
		modalStatus: "login",
		path: null,
		registerEmail: "",
		registerEmailChecked: false,
		registerEmailChecking: false,
		registerEmailError: null,
		registerEmailOk: false,
		registerPassword: "",
		registerPasswordConfirm: "",
		registerUsername: "",
		registerUsernameChecked: false,
		registerUsernameChecking: false,
		registerUsernameError: null,
		registerUsernameOk: false,
	};

	constructor(props: IProps) {
		super(props);

		this.checkEmail = this.checkEmail.bind(this);
		this.checkUsername = this.checkUsername.bind(this);
		this.closeLoginModal = this.closeLoginModal.bind(this);
		this.changeStatusClearState = this.changeStatusClearState.bind(this);
		this.goToForgot = this.goToForgot.bind(this);
		this.goToLogin = this.goToLogin.bind(this);
		this.goToRegister = this.goToRegister.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitForgot = this.submitForgot.bind(this);
		this.submitLogin = this.submitLogin.bind(this);
		this.submitRegistration = this.submitRegistration.bind(this);
	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			this.setState({
				path: window.location.pathname,
			});

		}
	}

	render() {

		return (

			<Modal
				isOpen={this.props.loginModalOpen}
				onRequestClose={this.closeLoginModal}
				className="loginModal"
				overlayClassName="modalOverlay"
			>

				<div id="loginModal">

					<ReactSVG
						className="modalClose"
						title="close"
						src={CloseIcon}
						onClick={this.closeLoginModal}
					/>

					{this.state.modalStatus === "login" ?

						<form id="loginForm" onSubmit={this.submitLogin} className={this.state.loading ? "disabled" : ""}>

							<h2>Login</h2>

							<div className="inputGroup">
								<label htmlFor="loginEmail">Email Address</label>
								<input
									id="loginEmail"
									name="loginEmail"
									type="email"
									required={true}
									disabled={this.state.loading}
									value={this.state.loginEmail}
									onChange={this.handleInputChange}
								/>
							</div>

							<div className="inputGroup">
								<label htmlFor="loginPassword">Password</label>
								<input
									id="loginPassword"
									name="loginPassword"
									type="password"
									required={true}
									pattern=".{8}.*"
									disabled={this.state.loading}
									value={this.state.loginPassword}
									onChange={this.handleInputChange}
								/>
							</div>

							<p className="formError">{this.state.errorMessage}</p>

							<div className="buttonRow">
								<button type="submit" disabled={!this.state.formValid || this.state.loading} className="largeButton">Login</button>
							</div>

							<div className="formFooter right">
								<p><strong><a href="" onClick={this.goToForgot}>Forgot your password?</a></strong></p>
								<p><strong>Don't have an account yet? <a href="" onClick={this.goToRegister}>Create one now!</a></strong></p>
							</div>

						</form>

					: this.state.modalStatus === "forgot" ?

						<form
							id="forgotForm"
							onSubmit={this.submitForgot}
							className={this.state.loading ? "disabled" : ""}
						>

							<h2>Forgot Password</h2>

							<p>Enter your email and we'll send you a link to set a new password.</p>

							<div className="inputGroup">
								<label htmlFor="forgotEmail">Email address</label>
								<input
									id="forgotEmail"
									name="forgotEmail"
									type="email"
									required={true}
									disabled={this.state.loading}
									value={this.state.forgotEmail}
									onChange={this.handleInputChange}
								/>
							</div>

							<p className="formError">{this.state.errorMessage}</p>

							<div className="buttonRow">
								<button type="submit" disabled={!this.state.formValid || this.state.loading} className="largeButton">Submit</button>
							</div>

							<div className="formFooter right">
								<p><strong>Just remembered your password? <a href="" onClick={this.goToLogin}>Try to log in</a></strong></p>
								<p><strong>Don't have an account yet? <a href="" onClick={this.goToRegister}>Create one now!</a></strong></p>
							</div>

						</form>

					: this.state.modalStatus === "register" ?

						<form
							id="registerForm"
							onSubmit={this.submitRegistration}
							className={this.state.loading ? "disabled" : ""}
						>

							<h2>Create an Account</h2>

							<div className="inputGroup">
								<label htmlFor="registerEmail">Email address</label>
								<input
									id="registerEmail"
									name="registerEmail"
									type="email"
									required={true}
									disabled={this.state.loading}
									value={this.state.registerEmail}
									onChange={this.handleInputChange}
								/>
								<p className="error" id="emailError">{this.state.registerEmailError}</p>
							</div>

							<div className="inputGroup">
								<label htmlFor="registerUsername">Display name (2+ characters, start with letter)</label>
								<input
									id="registerUsername"
									name="registerUsername"
									type="text"
									required={true}
									pattern="[A-Za-z].+"
									disabled={this.state.loading}
									value={this.state.registerUsername}
									onChange={this.handleInputChange}
								/>
								<p className="error" id="emailError">{this.state.registerUsernameError}</p>
							</div>

							<div className="inputGroup">
								<label htmlFor="registerPassword">Password (8+ characters)</label>
								<input
									id="registerPassword"
									name="registerPassword"
									type="password"
									required={true}
									pattern=".{8}.*"
									disabled={this.state.loading}
									value={this.state.registerPassword}
									onChange={this.handleInputChange}
								/>
							</div>

							<div className="inputGroup">
								<label htmlFor="registerPasswordConfirm">Confirm password</label>
								<input
									id="registerPasswordConfirm"
									name="registerPasswordConfirm"
									type="password"
									required={true}
									pattern=".{8}.*"
									disabled={this.state.loading}
									value={this.state.registerPasswordConfirm}
									onChange={this.handleInputChange}
								/>
							</div>

							<p className="formError">{this.state.errorMessage}</p>

							<div className="buttonRow">
								<button
									type="submit"
									disabled={!this.state.formValid
										|| this.state.registerPassword !== this.state.registerPasswordConfirm
										|| this.state.registerPassword.length < 8
										|| !this.state.registerEmailOk
										|| !this.state.registerUsernameOk
										|| this.state.loading}
									className="largeButton"
								>
									Register
								</button>
							</div>

							<div className="formFooter right">
								<p><strong>Already have an account? <a href="" onClick={this.goToLogin}>Log in now!</a></strong></p>
							</div>

						</form>

					: this.state.modalStatus === "forgotSuccess" ?

						<div>

							<h2>Forgot Password</h2>

							<p>An email has been sent to the email address you specified; click the link in that email to set a new password.</p>

							<div className="buttonRow">
								<button type="button" onClick={this.closeLoginModal} disabled={this.state.loading} className="largeButton">Close</button>
							</div>

						</div>

					: this.state.modalStatus === "registrationSuccess" ?

						<div>

							<h2>Create an Account</h2>

							<p>Your registration has been submitted.
								An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

							<div className="buttonRow">
								<button type="button" onClick={this.closeLoginModal} disabled={this.state.loading} className="largeButton">Close</button>
							</div>

						</div>

					: null}

					{ this.state.loading ?
						<div className={"loader medium" + (this.state.loading ? "" : " disabled")} />
					: null}

				</div>

			</Modal>

		);

	}

	changeStatusClearState(page: string): void {

		this.setState({
			errorMessage: "",
			loading: false,
			loginEmail: "",
			loginPassword: "",
			modalStatus: page,
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
		});

	}

	checkEmail(email: string): void {

		this.setState({
			registerEmailChecking: true,
			registerEmailOk: false,
		});

		const emailCheck = this.addPromise(
			checkEmail(email));

		emailCheck
			.then((emailUsed: boolean) => {

				if (emailUsed) {

					this.setState({
						registerEmailChecked: true,
						registerEmailChecking: false,
						registerEmailError: "That email has already been registered.",
						registerEmailOk: false,
					});

				} else {

					this.setState({
						registerEmailChecked: true,
						registerEmailChecking: false,
						registerEmailError: null,
						registerEmailOk: true,
					});

				}

			}).catch((error) => {

				this.setState({
					registerEmailChecked: true,
					registerEmailChecking: false,
					registerEmailError: "An error occurred.",
					registerEmailOk: false,
				});

			})
			.finally(emailCheck.clear);

	}

	checkUsername(username: string): void {

		this.setState({
			registerUsernameChecking: true,
			registerUsernameOk: false,
		});

		const nameCheck = this.addPromise(
			checkUsername(username));

		nameCheck
			.then((nameUsed: boolean) => {

				if (nameUsed) {

					this.setState({
						registerUsernameChecked: true,
						registerUsernameChecking: false,
						registerUsernameError: "That display name is already in use.",
						registerUsernameOk: false,
					});

				} else {

					this.setState({
						registerUsernameChecked: true,
						registerUsernameChecking: false,
						registerUsernameError: null,
						registerUsernameOk: true,
					});

				}

			}).catch((error) => {

				this.setState({
					registerUsernameChecked: true,
					registerUsernameChecking: false,
					registerUsernameError: "An error occurred.",
					registerUsernameOk: false,
				});

			})
			.finally(nameCheck.clear);

	}

	closeLoginModal(event?: React.MouseEvent<any>): void {

		if (event) {
			event.preventDefault();
		}

		this.changeStatusClearState("login");
		this.props.setLoginModalState(false);

	}

	handleInputChange <T extends keyof ILoginState>(event: React.ChangeEvent<HTMLInputElement>): void {

		const formId: string = (
			this.state.modalStatus === "login" ? "loginForm"
			: this.state.modalStatus === "register" ? "registerForm"
			: this.state.modalStatus === "forgot" ? "forgotForm"
			: null);

		const fieldName: (keyof ILoginState) = event.currentTarget.name as (keyof ILoginState);

		const newState = {
			[fieldName]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		};

		this.setState(newState as { [P in T]: ILoginState[P]; });

		if (fieldName === "registerUsername") {

			if (event.currentTarget.validity.valid) {

				this.checkUsername(event.currentTarget.value);

			} else {

				this.setState({
					registerUsernameChecked: false,
					registerUsernameChecking: false,
					registerUsernameError: null,
					registerUsernameOk: false,
				});

			}

		} else if (fieldName === "registerEmail") {

			if (event.currentTarget.validity.valid) {

				this.checkEmail(event.currentTarget.value);

			} else {

				this.setState({
					registerEmailChecked: false,
					registerEmailChecking: false,
					registerEmailError: null,
					registerEmailOk: false,
				});

			}

		}

	}

	goToForgot(event: React.MouseEvent<HTMLAnchorElement>): void {
		event.preventDefault();

		this.changeStatusClearState("forgot");

	}

	goToLogin(event: React.MouseEvent<HTMLAnchorElement>): void {
		event.preventDefault();

		this.changeStatusClearState("login");

	}

	goToRegister(event: React.MouseEvent<HTMLAnchorElement>): void {
		event.preventDefault();

		this.changeStatusClearState("register");

	}

	submitForgot(event: React.MouseEvent<HTMLFormElement>): void {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		const submitRequest = this.addPromise(
			submitForgotPassword(this.state.forgotEmail));

		submitRequest
			.then(() => {

				this.changeStatusClearState("forgotSuccess");

			}).catch((error) => {

				this.setState({
					errorMessage:
						error.response.data.errorCode === "notFound" ?
							"Sorry, we couldn't find an account using that email address.  Please try again."
						: error.response.data.errorCode === "email" ?
							"Sorry, there was a problem sending the email.  Please try again."
						: "Sorry, something went wrong on our end.  Please try again.",
					loading: false,
				});

			})
			.finally(submitRequest.clear);

	}

	submitLogin(event: React.MouseEvent<HTMLFormElement>): void {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		const loginAttempt = this.addPromise(
			login(
				this.state.loginEmail,
				this.state.loginPassword,
			));

		loginAttempt
			.then((userInfo: IUserInfo) => {

				this.props.setUserInfo(userInfo);

				this.changeStatusClearState("login");
				this.props.setLoginModalState(false);

			}).catch((error) => {
				console.error(error);

				this.setState({
					errorMessage: "Sorry, that login wasn't right.  Try again.",
					loading: false,
				});

			})
			.finally(loginAttempt.clear);

	}

	submitRegistration(event: React.MouseEvent<HTMLFormElement>): void {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		const registration = this.addPromise(
			registerUser(
				this.state.registerEmail,
				this.state.registerPassword,
				this.state.registerUsername,
			));

		registration
			.then(() => {

				this.changeStatusClearState("registrationSuccess");

			}).catch((error) => {

				this.setState({
					errorMessage: "Sorry, something went wrong.  Try again.",
					loading: false,
				});

			})
			.finally(registration.clear);

	}

}

export default withRouter(Login);
