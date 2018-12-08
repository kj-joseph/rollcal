import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";
import { IUserInfo } from "interfaces/user";

import { checkForgotPassword, setNewPassword } from "services/userService";

interface IForgotPasswordState {
	formError: string;
	password: string;
	passwordConfirm: string;
	status: "form" | "loadError" | "loading" | "submitting"| "success";
	userId: number;
	userName: string;
	validationCode: string;
}

export default class ForgotPassword extends RCComponent<IProps> {

	state: IForgotPasswordState = {
		formError: null,
		password: "",
		passwordConfirm: "",
		status: "loading",
		userId: null,
		userName: null,
		validationCode: this.props.match.params.validationCode,
	};

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.loadData = this.loadData.bind(this);
		this.submitPassword = this.submitPassword.bind(this);
	}

	componentDidMount() {

		this.props.setSessionState(this.props.sessionInitialized);
		this.loadData();

		this.props.setPageTitle({
			page: "Set New Password",
		});

	}

	render() {

		return (
			<React.Fragment>
				<h1>Set New Password</h1>

				{ this.state.status === "loading" || this.state.status === "submitting" ?

					<div className="loader" />

				: this.state.status === "loadError" ?

					<p>
						Sorry, something went wrong.  Give it another try;
						if it doesn't work, <Link to="/contact" title="Contact">give us a shout</Link>.
					</p>

				: this.state.status === "form" ?

					<form id="passwordForm" onSubmit={this.submitPassword}>

						<p>Hi, {this.state.userName}!  Please set a new password for your account.</p>

						<div className="inputGroup">
							<label htmlFor="password">New Password</label>
							<input
								id="password"
								name="password"
								type="password"
								required={true}
								pattern=".{8}.*"
								value={this.state.password}
								onChange={this.handleInputChange}
							/>
						</div>

						<div className="inputGroup">
							<label htmlFor="passwordConfirm">Confirm New Password</label>
							<input
								id="passwordConfirm"
								name="passwordConfirm"
								type="password"
								required={true}
								pattern=".{8}.*"
								value={this.state.passwordConfirm}
								onChange={this.handleInputChange}
							/>
							{document.getElementById("passwordForm")
								&& (document.getElementById("passwordForm") as HTMLFormElement).checkValidity()
								&& this.state.password !== this.state.passwordConfirm ?
								<p className="error">The two passwords don't match.</p>
							: ""}
						</div>

						<p className="formError">{this.state.formError}</p>

						<div className="buttonRow">
							<button
								type="submit"
								disabled={!document.getElementById("passwordForm")
									|| (!!document.getElementById("passwordForm")
										&& (!((document.getElementById("passwordForm") as HTMLFormElement).checkValidity())
											|| this.state.password !== this.state.passwordConfirm))
								}
								className="largeButton"
							>
								Submit
							</button>
						</div>

					</form>

				: this.state.status === "success" ?

					<p>Your password has been reset.</p>

				: ""
				}
			</React.Fragment>
		);

	}

	handleInputChange <T extends keyof IForgotPasswordState>(event: React.ChangeEvent<HTMLInputElement>) {

		const fieldName: (keyof IForgotPasswordState) = event.currentTarget.name as (keyof IForgotPasswordState);
		const newState = {
			[fieldName]: event.currentTarget.value,
		};

		this.setState(newState as { [P in T]: IForgotPasswordState[P]; });

	}

	submitPassword(event: React.MouseEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			status: "submitting",
		});

		const setPassword = this.addPromise(
			setNewPassword(
				this.state.userId,
				this.state.password,
				this.state.validationCode,
			));

		setPassword
			.then(() => {

				this.setState({
					status: "success",
				});

			}).catch((error) => {

				this.setState({
					formError: "Sorry, something went wrong.  Please try again.",
					status: "form",
				});

			})
			.finally(setPassword.clear);

	}

	loadData() {

		const checkCode = this.addPromise(
			checkForgotPassword(this.state.validationCode));

		checkCode
			.then((result: IUserInfo) => {

				this.setState({
					status: "form",
					userId: result.userId,
					userName: result.userName,
				});

			}).catch((error) => {
				console.error(error);

				this.setState({
					status: "loadError",
				});

			})
			.finally(checkCode.clear);

	}

}
