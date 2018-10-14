import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export default class Login<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
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
		};

		this.closeLoginBox = this.closeLoginBox.bind(this);
		this.goToLogin = this.goToLogin.bind(this);
		this.goToRegister = this.goToRegister.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitLogin = this.submitLogin.bind(this);
		this.submitRegistration = this.submitRegistration.bind(this);

	}

	closeLoginBox(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		if (!this.state.loading) {
			this.props.setLoginBoxState(false);
			this.setState({
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

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		const formId: string = (this.state.status === "login" ? "loginForm" : this.state.status === "register" ? "registerForm" : null);

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		});
	}

	goToLogin(event: React.MouseEvent<HTMLButtonElement>) {
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

	goToRegister(event: React.MouseEvent<HTMLButtonElement>) {
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
				sessionStorage.setItem("rollCalUserId", result.data.response.userId);
				sessionStorage.setItem("rollCalUserName", result.data.response.userName);
				sessionStorage.setItem("rollCalUserIsAdmin", result.data.response.isAdmin);
				sessionStorage.setItem("rollCalUserSessionId", result.data.response.sessionId);

				this.props.setLoginBoxState(false);

				this.props.setIUserInfo({
					loggedIn: true,
					loggedInUserAdmin: result.data.response.isAdmin,
					loggedInUserId: result.data.response.userId,
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

			}).catch((error: AxiosError) => {
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

		axios.post(this.props.apiLocation + "auth/register/checkEmail", {email: this.state.registerEmail})
			.then((result: AxiosResponse) => {
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
								email: this.state.registerEmail,
								emailEncoded: encodeURIComponent(this.state.registerEmail.replace(/\./g, "%2E")),
								service_id: "server",
								template_id: "account_validation",
								template_params: {
								user_id: "user_hX0Eb4e3DRLA6dAAUMHKu",
								username: this.state.registerUsername,
								usernameEncoded: encodeURIComponent(this.state.registerUsername.replace(/\./g, "%2E")),
								validationCode: result.data.response.validationCode,
							}})
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

	render() {

		return (

			<React.Fragment>

				{this.props.loginBoxOpen ?

					<div id="loginBox">

						{this.state.status === "login" ?

						<form id="loginForm" onSubmit={this.submitLogin} className={this.state.loading ? "disabled" : ""}>

							<span className="loginClose" title="close" onClick={this.closeLoginBox}>X</span>

							<h2>Login</h2>

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

							<div className="buttons">
								<button type="submit" disabled={!this.state.formValid || this.state.loading} className="largeButton">Login</button>
								<button type="button" onClick={this.goToRegister} disabled={this.state.loading} className="largeButton pinkButton">Register</button>
							</div>

							<p className="errorMessage">{this.state.errorMessage}</p>

						</form>

						: this.state.status === "register" ?

						<form id="registerForm" onSubmit={this.submitRegistration} className={this.state.loading ? "disabled" : ""}>

							<span className="loginClose" title="close" onClick={this.closeLoginBox}>X</span>

							<h2>Register</h2>

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

							<div className="buttons">
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
								<button type="button" onClick={this.goToLogin} disabled={this.state.loading} className="largeButton pinkButton">Login</button>
							</div>

							<p className="errorMessage">{this.state.errorMessage}</p>

						</form>

						: this.state.status === "regComplete" ?

						<div className="registrationComplete">

							<p>Your registration has been submitted.
								An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

							<div className="buttons">
								<button type="button" onClick={this.closeLoginBox} disabled={this.state.loading} className="largeButton">Close</button>
							</div>

						</div>

						: "" }

						{ this.state.loading ?
							<div className={"loader medium" + (this.state.loading ? "" : " disabled")} />
						: "" }

					</div>

				: "" }

			</React.Fragment>

		);

	}

}
