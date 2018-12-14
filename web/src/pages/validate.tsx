import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IProps } from "interfaces/redux";

import { validateAccount } from "services/userService";

interface IValidateState {
	status: "error" | "valid" | "validating";
	validationCode: string;
}

export default class Validate extends RCComponent<IProps> {

	validationParts = decodeURIComponent(this.props.match.params.validationCode).split("||");

	state: IValidateState = {
		status: "validating",
		validationCode: this.props.match.params.validationCode,
	};

	constructor(props: IProps) {
		super(props);

		this.loadData = this.loadData.bind(this);
	}

	componentDidMount() {

		this.props.setSessionState(this.props.sessionInitialized);
		this.loadData();

		this.props.setPageTitle({
			detail: "Account Validation",
			page: "User Dashboard",
		});

	}

	render() {

		return (
			<>
				<h1>Account Validation</h1>

				{ this.state.status === "validating" ?
					<div className="loader" />

				: this.state.status === "valid" ?
					<p>It's all good; we've validated your account!  You can now log in and add events to the site.  Thanks for joining!</p>

				: this.state.status === "error" ?
					<p>
						Sorry, something went wrong.  Give it another try;
						if it doesn't work, <Link to="/contact" title="Contact">give us a shout</Link>.
					</p>

				: null}

			</>
		);

	}

	loadData() {

		const validation = this.addPromise(
			validateAccount(this.state.validationCode));

		validation
			.then(() => {

				this.setState({
					status: "valid",
				});

			}).catch((error) => {

				this.setState({
					status: "error",
				});

			})
			.finally(validation.clear);

	}

}
