import React from "react";
import { NavLink } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import { IProps } from "interfaces/redux";

interface IValidateState {
	email: string;
	status: string;
	username: string;
	validationCode: string;
}

export default class Validate extends React.Component<IProps, IValidateState> {

	constructor(props: IProps) {
		super(props);

		const validationParts = decodeURIComponent(this.props.match.params.validationCode).split("||");

		this.state = {
			email: validationParts[1],
			status: "validating",
			username: validationParts[2],
			validationCode: validationParts[0],
		};

		this.loadData = this.loadData.bind(this);

	}

	componentDidMount() {

		this.props.setSessionState(this.props.sessionInitialized);
		this.loadData();

	}

	loadData() {

		axios.post(this.props.apiLocation + "user/account/validate", {
			email: this.state.email,
			username: this.state.username,
			validationCode: this.state.validationCode,
		}, { withCredentials: true })
		.then((result: AxiosResponse) => {
			this.setState({
				status: "valid",
			});
		}).catch((error: AxiosError) => {
			console.error(error);
			this.setState({
				status: "error",
			});
		});

	}

	render() {

		return (
			<React.Fragment>
				<h1>Account Validation</h1>
				{ this.state.status === "validating" ?
					<div className="loader" />

				: this.state.status === "valid" ?
					<p>It's all good; we've validated your account!  You can now log in and add events to the site.  Thanks for joining!</p>

				: this.state.status === "error" ?
					<p>
						Sorry, something went wrong.  Give it another try;
						if it doesn't work, <NavLink exact={true} to="/contact" title="Contact">give us a shout</NavLink>.
					</p>

				: ""
				}
			</React.Fragment>
		);

	}

}
