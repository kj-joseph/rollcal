import React from "react";

import axios from "axios";

import { IProps } from "interfaces/redux";

interface IContactState {
	contactEmail: string;
	contactMessage: string;
	contactName: string;
	formError: string;
	status: "form" | "success";
	submitting: boolean;
	userId: number;
}

export default class Contact extends React.Component<IProps> {

	state: IContactState = {
		contactEmail: this.props.loggedInUserEmail || "",
		contactMessage: "",
		contactName: this.props.loggedInUserName || "",
		formError: null,
		status: "form",
		submitting: false,
		userId: null,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitContact = this.submitContact.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				contactEmail: this.props.loggedInUserEmail || "",
				contactName: this.props.loggedInUserName || "",
				userId: this.props.loggedInUserId,
			});

		}

	}

	render() {

		return (

			<div className="contact">

				<h1>Contact Us</h1>

				{ this.state.status === "form" ?

					<form id="contactForm" onSubmit={this.submitContact} className={this.state.submitting ? "disabled" : ""}>

						<p>Have a question?  Got an error?  Want to help out?  Let us know by filling out the form below</p>

						<div className="inputGroup">
							<label htmlFor="contactName">Name</label>
							<input
								id="contactName"
								name="contactName"
								type="text"
								required={true}
								disabled={this.state.submitting || !!this.props.loggedInUserName}
								value={this.state.contactName}
								onChange={this.handleInputChange}
							/>
						</div>

						<div className="inputGroup">
							<label htmlFor="contactEmail">Email Address</label>
							<input
								id="contactEmail"
								name="contactEmail"
								type="email"
								required={true}
								disabled={this.state.submitting || !!this.props.loggedInUserEmail}
								value={this.state.contactEmail}
								onChange={this.handleInputChange}
							/>
						</div>

						<div className="inputGroup">
							<label htmlFor="contactMessage">Message</label>
							<textarea
								id="contactMessage"
								name="contactMessage"
								required={true}
								disabled={this.state.submitting}
								value={this.state.contactMessage}
								onChange={this.handleInputChange}
							/>
						</div>

						<p className="formError">{this.state.formError}</p>

						<div className="buttonRow">
							<button
								type="submit"
								disabled={!this.state.contactEmail || !this.state.contactMessage || !this.state.contactName}
								className="largeButton"
							>
								Send
							</button>
						</div>

					</form>

				: this.state.status === "success" ?

					<p>Your message was sent!  We'll get back to you as soon as possible.</p>

				: ""}

				{ this.state.submitting ?
					<div className="loader" />
				: ""}

			</div>
		);

	}

	handleInputChange <T extends keyof IContactState>(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {

		const fieldName: (keyof IContactState) = event.currentTarget.name as (keyof IContactState);
		const newState = {
			[fieldName]: event.currentTarget.value,
		};

		this.setState(newState as { [P in T]: IContactState[P]; });

	}

	submitContact(event: React.MouseEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			submitting: true,
		});

		axios.post(this.props.apiLocation + "contact/", {
				email: this.state.contactEmail,
				message: this.state.contactMessage,
				name: this.state.contactName,
			},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					status: "success",
					submitting: false,
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						formError: "Sorry, something went wrong.  Please try again.",
						status: "form",
						submitting: false,
					});
				}

			});


	}

}
