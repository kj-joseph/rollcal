import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import axios from "axios";

export default class Validate extends React.Component {

	constructor(props) {
		super(props);

		let validationParts = decodeURIComponent(this.props.match.params.validationCode).split("||")

		this.state = {
			validationCode: validationParts[0],
			email: validationParts[1],
			username: validationParts[2],
			status: "validating"
		}

	}

	componentWillMount() {

		axios.post(this.props.apiLocation + "auth/validate", {
			username: this.state.username,
			email: this.state.email,
			validationCode: this.state.validationCode
		})
		.then(result => {
			this.setState({
				status: "valid"
			})
		}).catch(error => {
			this.setState({
				status: "error"
			})
		});

	}

	render() {

		return (
			<React.Fragment>
				<h1>Account Validation</h1>
				{ this.state.status === "validating" ?
					<div className="loader"></div> 

				: this.state.status === "valid" ?
					<p>It's all good; we've validated your account!  You can now log in and add events to the site.  Thanks for joining!</p> 

				: this.state.status === "error" ?
					<p>Sorry, something went wrong.  Give it another try; if it doesn't work, <NavLink exact to="/contact" title="Contact">give us a shout</NavLink>.</p>

				: ""
				}
			</React.Fragment>
		);

	}

}