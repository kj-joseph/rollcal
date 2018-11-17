import React from "react";
import { withRouter } from "react-router";

import Modal from "react-modal";
Modal.setAppElement("#root");

import axios from "axios";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import { IProps } from "interfaces/redux";

interface ILoginState {
	errorMessage: string;
	formValid: boolean;
	loading: boolean;
	loginEmail: string;
	loginPassword: string;
	modalStatus: string;
	path: string;
	registerEmail: string;
	registerPassword: string;
	registerPasswordConfirm: string;
	registerUsername: string;
}

class Login extends React.Component<IProps> {

	state: ILoginState = {
		errorMessage: null,
		formValid: false,
		loading: false,
		loginEmail: "",
		loginPassword: "",
		modalStatus: "login",
		path: null,
		registerEmail: "",
		registerPassword: "",
		registerPasswordConfirm: "",
		registerUsername: "",
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.closeLoginModal = this.closeLoginModal.bind(this);
		this.changeStatusClearState = this.changeStatusClearState.bind(this);
		this.goToLogin = this.goToLogin.bind(this);
		this.goToRegister = this.goToRegister.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
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

	componentWillUnmount() {
		this.axiosSignal.cancel();
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
								<p><strong>Don't have an account yet? <a href="" onClick={this.goToRegister}>Create one now!</a></strong></p>
							</div>

						</form>

					: this.state.modalStatus === "register" ?

						<form id="registerForm" onSubmit={this.submitRegistration} className={this.state.loading ? "disabled" : ""}>

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
							</div>

							<div className="inputGroup">
								<label htmlFor="registerUsername">Display name (2+ characters)</label>
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

					: this.state.modalStatus === "regComplete" ?

						<div className="registrationComplete">

							<p>Your registration has been submitted.
								An email has been sent to the email address you specified; follow the instructions to validate your account.</p>

							<div className="buttonRow">
								<button type="button" onClick={this.closeLoginModal} disabled={this.state.loading} className="largeButton">Close</button>
							</div>

						</div>

					: ""}

					{ this.state.loading ?
						<div className={"loader medium" + (this.state.loading ? "" : " disabled")} />
					: ""}

				</div>

			</Modal>

		);

	}

	closeLoginModal(event?: React.MouseEvent<any>) {

		if (event) {
			event.preventDefault();
		}

		this.changeStatusClearState("login");
		this.props.setLoginModalState(false);

	}

	handleInputChange <T extends keyof ILoginState>(event: React.ChangeEvent<HTMLInputElement>) {

		const formId: string = (this.state.modalStatus === "login" ? "loginForm" : this.state.modalStatus === "register" ? "registerForm" : null);

		const fieldName: (keyof ILoginState) = event.currentTarget.name as (keyof ILoginState);

		const newState = {
			[fieldName]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		};

		this.setState(newState as { [P in T]: ILoginState[P]; });

	}

	goToLogin(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();

		this.changeStatusClearState("login");

	}

	goToRegister(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();

		this.changeStatusClearState("register");

	}

	submitLogin(event: React.MouseEvent<HTMLFormElement>) {
		event.preventDefault();

		this.setState({
			loading: true,
		});

		axios.post(this.props.apiLocation + "user/login", {
				email: this.state.loginEmail,
				password: this.state.loginPassword,
			},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.props.setUserInfo({
					loggedIn: true,
					userEmail: result.data.email,
					userId: result.data.id,
					userName: result.data.username,
					userRoles: result.data.roles,
				});

				this.changeStatusClearState("login");

				this.props.setLoginModalState(false);

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						errorMessage: "Sorry, that login wasn't right.  Try again.",
						loading: false,
					});
				}

			});

	}

	submitRegistration(event: React.MouseEvent<HTMLFormElement>) {
		event.preventDefault();
		this.setState({
			loading: true,
		});

		axios.get(`${this.props.apiLocation}user/register/checkEmail?email=${this.state.registerEmail}`,
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {
				if (result.data) {

					this.setState({
						errorMessage: "Someone's already signed up with that email address.  Try another one.",
						loading: false,
					});

				} else {

					axios.post(this.props.apiLocation + "user/register", {
						email: this.state.registerEmail,
						password: this.state.registerPassword,
						username: this.state.registerUsername,
						},
						{
							cancelToken: this.axiosSignal.token,
							withCredentials: true,
						})
						.then((registerResult) => {

							this.changeStatusClearState("regComplete");

						}).catch((error) => {
							console.error(error);

							if (!axios.isCancel(error)) {
								this.setState({
									errorMessage: "Sorry, something went wrong.  Try again.",
									loading: false,
								});
							}

						});

				}

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						errorMessage: "Sorry, something went wrong.  Try again.",
						loading: false,
					});
				}

			});

	}

	changeStatusClearState(page: string) {

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

}

export default withRouter(Login);
