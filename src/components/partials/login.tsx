import React from "react";
import { withRouter } from "react-router";

import Modal from "react-modal";
Modal.setAppElement("#root");

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import * as auth from "components/lib/auth";

class Login<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			errorMessage: "",
			formValid: false,
			loading: false,
			loginEmail: "",
			loginPassword: "",
			path: "",
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
			status: "login",
		};

		this.closeLoginModal = this.closeLoginModal.bind(this);
		this.goToLogin = this.goToLogin.bind(this);
		this.goToRegister = this.goToRegister.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitLogin = this.submitLogin.bind(this);
		this.submitRegistration = this.submitRegistration.bind(this);

	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			auth.checkLoginStatus(this.props);

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
				contentLabel="Example Modal"
				className="loginModal"
				overlayClassName="modalOverlay"
			>

			<div id="Login">

				{this.state.status === "login" ?

				<form id="loginForm" onSubmit={this.submitLogin} className={this.state.loading ? "disabled" : ""}>

					<span className="loginClose" title="close" onClick={this.closeLoginModal}>X</span>

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
							disabled={this.state.loading}
							value={this.state.loginPassword}
							onChange={this.handleInputChange}
						/>
					</div>

					<p className="formError">{this.state.errorMessage}</p>

					<div className="formButtons">
						<button type="submit" disabled={!this.state.formValid || this.state.loading} className="largeButton">Login</button>
					</div>

					<div className="formFooter">
						<p>Don't have an account yet? <a href="" onClick={this.goToRegister}>Create one now!</a></p>
					</div>

				</form>

				: this.state.status === "register" ?

				<form id="registerForm" onSubmit={this.submitRegistration} className={this.state.loading ? "disabled" : ""}>

					<span className="loginClose" title="close" onClick={this.closeLoginModal}>X</span>

					<h2>Create an Account</h2>

					<div className="inputGroup">
						<label htmlFor="registerEmail">Email Address</label>
						<input
							id="registerEmail"
							name="registerEmail"
							type="email"
							required={true}
							disabled={this.state.loading}
							value={this.state.registerEmail}
							onChange={this.handleInputChange}
						/>
					</div>

					<div className="inputGroup">
						<label htmlFor="registerUsername">Username (2+ characters)</label>
						<input
							id="registerUsername"
							name="registerUsername"
							type="text"
							required={true}
							title="Must start with a letter; only letters, numbers, -, _, and ."
							pattern="[A-Za-z][A-Za-z0-9-_\.]+"
							disabled={this.state.loading}
							value={this.state.registerUsername}
							onChange={this.handleInputChange}
						/>
					</div>

					<div className="inputGroup">
						<label htmlFor="registerPassword">Password (8+ characters)</label>
						<input
							id="registerPassword"
							name="registerPassword"
							type="password"
							required={true}
							disabled={this.state.loading}
							value={this.state.registerPassword}
							onChange={this.handleInputChange}
						/>
					</div>

					<div className="inputGroup">
						<label htmlFor="registerPasswordConfirm">Confirm Password</label>
						<input
							id="registerPasswordConfirm"
							name="registerPasswordConfirm"
							type="password"
							required={true}
							disabled={this.state.loading}
							value={this.state.registerPasswordConfirm}
							onChange={this.handleInputChange}
						/>
					</div>

					<p className="formError">{this.state.errorMessage}</p>

					<div className="formButtons">
						<button
							type="submit"
							disabled={!this.state.formValid
								|| this.state.registerPassword !== this.state.registerPasswordConfirm
								|| this.state.registerPassword.length < 8
								|| this.state.loading}
							className="largeButton"
						>
							Register
						</button>
					</div>

					<div className="formFooter">
						<p>Already have an account? <a href="" onClick={this.goToLogin}>Log in now!</a></p>
					</div>

				</form>

				: this.state.status === "regComplete" ?

				<div className="registrationComplete">

					<p>Your registration has been submitted.
						An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

					<div className="formButtons">
						<button type="button" onClick={this.closeLoginModal} disabled={this.state.loading} className="largeButton">Close</button>
					</div>

				</div>

				: "" }

				{ this.state.loading ?
					<div className={"loader medium" + (this.state.loading ? "" : " disabled")} />
				: "" }

			</div>

			</Modal>

		);

	}

	closeLoginModal(event?: React.MouseEvent<any>) {

		if (event) {
			event.preventDefault();
		}

		this.setState({
			formValid: false,
			loading: false,
			loginEmail: "",
			loginPassword: "",
			path: "",
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
			status: "login",
		});

		this.props.setLoginModalState(false);

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		const formId: string = (this.state.status === "login" ? "loginForm" : this.state.status === "register" ? "registerForm" : null);

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		});
	}

	goToLogin(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();

		this.setState({
			errorMessage: "",
			formValid: false,
			loading: false,
			loginEmail: "",
			loginPassword: "",
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
			status: "login",
		});

	}

	goToRegister(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();

		this.setState({
			errorMessage: "",
			formValid: false,
			loading: false,
			loginEmail: "",
			loginPassword: "",
			registerEmail: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			registerUsername: "",
			status: "register",
		});

	}

	submitLogin(event: React.MouseEvent<HTMLFormElement>) {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		axios.post(this.props.apiLocation + "auth/login", {
			email: this.state.loginEmail,
			password: this.state.loginPassword,
		}).then((result: AxiosResponse) => {

			sessionStorage.setItem("rollCalUserId", result.data.response.id);
			sessionStorage.setItem("rollCalUserName", result.data.response.username);
			sessionStorage.setItem("rollCalUserPermissions", result.data.response.permissions);
			sessionStorage.setItem("rollCalToken", result.data.response.token);

			this.props.setUserInfo({
				loggedIn: true,
				loggedInUserId: result.data.response.id,
				loggedInUserName: result.data.response.username,
				loggedInUserPermissions: result.data.response.permissions.split(","),
			});

			this.setState({
				errorMessage: "",
				loading: false,
				loginEmail: "",
				loginPassword: "",
				registerEmail: "",
				registerPassword: "",
				registerPasswordConfirm: "",
				registerUsername: "",
				status: "login",
			});

			this.props.setLoginModalState(false);
			this.props.setMobileMenuState(false);

		}).catch((error: AxiosError) => {
			console.error(error);
			this.setState({
				errorMessage: "Sorry, that login wasn't right.  Try again.",
				loading: false,
			});
		});

	}

	submitRegistration(event: React.MouseEvent<HTMLFormElement>) {
		event.preventDefault();
		this.setState({
			loading: true,
		});

		axios.post(this.props.apiLocation + "auth/register/checkEmail", {
			email: this.state.registerEmail,
		}).then((result: AxiosResponse) => {
				if (result.data.response) {

					this.setState({
						errorMessage: "Someone's already signed up with that email address.  Try another one.",
						loading: false,
					});

				} else {

					axios.post(this.props.apiLocation + "auth/register", {
						email: this.state.registerEmail,
						password: this.state.registerPassword,
						username: this.state.registerUsername,

						}).then((registerResult: AxiosResponse) => {

							axios.post("https://api.emailjs.com/api/v1.0/email/send", {
								service_id: "server",
								template_id: "account_validation",
								template_params: {
									email: this.state.registerEmail,
									emailEncoded: encodeURIComponent(this.state.registerEmail.replace(/\./g, "%2E")),
									username: this.state.registerUsername,
									usernameEncoded: encodeURIComponent(this.state.registerUsername.replace(/\./g, "%2E")),
									validationCode: registerResult.data.response.validationCode,
								},
								user_id: "user_hX0Eb4e3DRLA6dAAUMHKu",
							})
							.then((response: any) => {

								this.setState({
									errorMessage: "",
									formValid: false,
									loading: false,
									loginEmail: "",
									loginPassword: "",
									registerEmail: "",
									registerPassword: "",
									registerPasswordConfirm: "",
									registerUsername: "",
									status: "regComplete",
								});

							}).catch((error: any) => {
								console.error(error);

								this.setState({
									errorMessage: "Sorry, something went wrong.  Try again.",
									loading: false,
								});
							});

						}).catch((error: AxiosError) => {
							console.error(error);

							this.setState({
								errorMessage: "Sorry, something went wrong.  Try again.",
								loading: false,
							});
						});

				}

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					errorMessage: "Sorry, something went wrong.  Try again.",
					loading: false,
				});
			});

	}

}

export default withRouter(Login);
