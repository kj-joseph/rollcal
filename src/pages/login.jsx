import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import axios from "axios";

export default class Login extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loginEmail: "",
			loginPassword: "",
			registerEmail: "",
			registerUsername: "",
			registerPassword: "",
			registerPasswordConfirm: "",
			formValid: false,
			loader: false,
			status: "login",
			errorMessage: ""
		}

		this.closeLoginBox = event => {
			event.preventDefault();
			if (!this.state.loading) {
				this.props.setLoginBoxState(false);
				this.setState({
					loginEmail: "",
					loginPassword: "",
					registerEmail: "",
					registerUsername: "",
					registerPassword: "",
					registerPasswordConfirm: "",
					formValid: false,
					loading: false,
					status: "login"
				});
			}
		}

		this.handleInputChange = event => {
			let formId;

			if (this.state.status === "login") {
				formId = "loginForm";
			} else if (this.state.status === "register") {
				formId = "registerForm";
			}

			this.setState({
				[event.target.name]: event.target.value,
				formValid: document.getElementById(formId).checkValidity()
			});
		}

		this.goToLogin = event => {
			event.preventDefault();

			this.setState({
				loginEmail: "",
				loginPassword: "",
				registerEmail: "",
				registerUsername: "",
				registerPassword: "",
				registerPasswordConfirm: "",
				formValid: false,
				loading: false,
				status: "login",
				errorMessage: ""
			});

		}

		this.goToRegister = event => {
			event.preventDefault();

			this.setState({
				loginEmail: "",
				loginPassword: "",
				registerEmail: "",
				registerUsername: "",
				registerPassword: "",
				registerPasswordConfirm: "",
				formValid: false,
				loading: false,
				status: "register",
				errorMessage: ""
			});

		}

		this.submitLogin = event => {
			event.preventDefault();
			this.setState({
				loading: true
			});

			axios.post(this.props.apiLocation + "auth/login", {
				email: this.state.loginEmail,
				password: this.state.loginPassword

			}).then(result => {
				sessionStorage.setItem("rollCalUserId", result.data.response.userId);
				sessionStorage.setItem("rollCalUserName", result.data.response.userName);
				sessionStorage.setItem("rollCalUserIsAdmin", result.data.response.isAdmin);
				sessionStorage.setItem("rollCalUserSessionId", result.data.response.sessionId);

				this.props.setLoginBoxState(false);

				this.props.setUserInfo({
					loggedIn: true,
					loggedInUserId: result.data.response.userId,
					loggedInUserAdmin: result.data.response.isAdmin
				});

				this.setState({
					loginEmail: "",
					loginPassword: "",
					registerEmail: "",
					registerUsername: "",
					registerPassword: "",
					registerPasswordConfirm: "",
					loading: false,
					status: "login",
					errorMessage: ""
				});

			}).catch(error => {
				this.setState({
					loading: false,
					errorMessage: "Sorry, that login wasn't right.  Try again."
				});
			});

		}

		this.submitRegistration = event => {
			event.preventDefault();
			this.setState({
				loading: true
			});

			axios.post(this.props.apiLocation + "auth/register/checkEmail", {email: this.state.registerEmail})
			.then(result => {
				if (result.data.response) {

					this.setState({
						loading: false,
						errorMessage: "Someone's already signed up with that email address.  Try another one."
					});

				} else { 

					axios.post(this.props.apiLocation + "auth/register", {
						email: this.state.registerEmail,
						username: this.state.registerUsername,
						password: this.state.registerPassword

					}).then(result => {

						emailjs.send("server", "account_validation", {
							username: this.state.registerUsername,
							usernameEncoded: encodeURIComponent(this.state.registerUsername.replace(/\./g,"%2E")),
							email: this.state.registerEmail,
							emailEncoded: encodeURIComponent(this.state.registerEmail.replace(/\./g,"%2E")),
							validationCode: result.data.response.validationCode
						}, "user_hX0Eb4e3DRLA6dAAUMHKu").then(response => {

							this.setState({
								loginEmail: "",
								loginPassword: "",
								registerEmail: "",
								registerUsername: "",
								registerPassword: "",
								registerPasswordConfirm: "",
								formValid: false,
								loading: false,
								errorMessage: "",
								status: "regComplete"
							});

						}).catch(error => {
							this.setState({
								loading: false,
								errorMessage: "Sorry, something went wrong.  Try again."
							});
						});

					}).catch(error => {
						this.setState({
							loading: false,
							errorMessage: "Sorry, something went wrong.  Try again."
						});
					});


				}

			}).catch(error => {
				this.setState({
					loading: false,
					errorMessage: "Sorry, something went wrong.  Try again."
				});
			})

		}

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
							<input id="loginEmail" name="loginEmail" type="email" required
								disabled={this.state.loading}
								value={this.state.loginEmail} onChange={this.handleInputChange} />

							<label htmlFor="loginPassword">Password</label>
							<input id="loginPassword" name="loginPassword" type="password" required
								disabled={this.state.loading}
								value={this.state.loginPassword} onChange={this.handleInputChange} />

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
							<input id="registerEmail" name="registerEmail" type="email" required
								disabled={this.state.loading}
								value={this.state.registerEmail} onChange={this.handleInputChange} />

							<label htmlFor="registerUsername">Username (2+ characters)</label>
							<input id="registerUsername" name="registerUsername" type="text" required
								title="Must start with a letter; only letters, numbers, -, _, and ."
								pattern="[A-Za-z][A-Za-z0-9-_\.]+"
								disabled={this.state.loading}
								value={this.state.registerUsername} onChange={this.handleInputChange} />

							<label htmlFor="registerPassword">Password (8+ characters)</label>
							<input id="registerPassword" name="registerPassword" type="password" required
								disabled={this.state.loading}
								value={this.state.registerPassword} onChange={this.handleInputChange} />

							<label htmlFor="registerPasswordConfirm">Confirm Password</label>
							<input id="registerPasswordConfirm" name="registerPasswordConfirm" type="password" required
								disabled={this.state.loading}
								value={this.state.registerPasswordConfirm} onChange={this.handleInputChange} />

							<div className="buttons">
								<button type="submit" disabled={!this.state.formValid || this.state.registerPassword !== this.state.registerPasswordConfirm || this.state.registerPassword.length < 8 || this.state.loading} className="largeButton">Register</button>
								<button type="button" onClick={this.goToLogin} disabled={this.state.loading} className="largeButton pinkButton">Login</button>
							</div>

							<p className="errorMessage">{this.state.errorMessage}</p>

						</form>

						: this.state.status === "regComplete" ?

						<div className="registrationComplete">

							<p>Your registration has been submitted.  An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

							<div className="buttons">
								<button type="button" onClick={this.closeLoginBox} disabled={this.state.loading} className="largeButton">Close</button>
							</div>

						</div>

						: "" }

						{ this.state.loading ? 
							<div className={"loader medium" + (this.state.loading ? "" : " disabled")}></div>
						: "" }

					</div>

				: "" }

			</React.Fragment>

		);

	}

}
