import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { IProps } from "interfaces/redux";

interface IValidateState {
	status: "error" | "valid" | "validating";
	validationCode: string;
}

export default class Validate extends React.Component<IProps> {

	validationParts = decodeURIComponent(this.props.match.params.validationCode).split("||");

	state: IValidateState = {
		status: "validating",
		validationCode: this.props.match.params.validationCode,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.loadData = this.loadData.bind(this);
	}

	componentDidMount() {

		this.props.setSessionState(this.props.sessionInitialized);
		this.loadData();

	}

	componentWillUnmount() {
		this.axiosSignal.cancel();
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
						if it doesn't work, <Link to="/contact" title="Contact">give us a shout</Link>.
					</p>

				: ""
				}
			</React.Fragment>
		);

	}

	loadData() {

		axios.post(this.props.apiLocation + "user/account/validate", {
				validationCode: this.state.validationCode,
			},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					status: "valid",
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						status: "error",
					});
				}

			});

	}

}
