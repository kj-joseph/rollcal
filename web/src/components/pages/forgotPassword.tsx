import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { IProps } from "interfaces/redux";

interface IForgotPasswordState {
	formError: string;
	password: string;
	passwordConfirm: string;
	status: "form" | "loadError" | "loading" | "submitting"| "success";
	userId: number;
	userName: string;
	validationCode: string;
}

export default class ForgotPassword extends React.Component<IProps> {

	validationParts = decodeURIComponent(this.props.match.params.validationCode).split("||");

	state: IForgotPasswordState = {
		formError: null,
		password: "",
		passwordConfirm: "",
		status: "loading",
		userId: null,
		userName: null,
		validationCode: this.props.match.params.validationCode,
	};

	axiosSignal = axios.CancelToken.source();

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

	componentWillUnmount() {
		this.axiosSignal.cancel();
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

		axios.post(this.props.apiLocation + "user/account/setNewPassword", {
				id: this.state.userId,
				password: this.state.password,
				validationCode: this.state.validationCode,
			},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					status: "success",
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						formError: "Sorry, something went wrong.  Please try again.",
						status: "form",
					});
				}

			});


	}

	loadData() {

		axios.post(this.props.apiLocation + "user/checkForgotPassword", {
				validationCode: this.state.validationCode,
			},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					status: "form",
					userId: result.data.user_id,
					userName: result.data.user_name,
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						status: "loadError",
					});
				}

			});

	}

}
