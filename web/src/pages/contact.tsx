import RCComponent from "components/rcComponent";
import React from "react";

import { sendContactEmail } from "services/emailService";

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

export default class Contact extends RCComponent<IProps> {

	state: IContactState = {
		contactEmail: this.props.user.email || "",
		contactMessage: "",
		contactName: this.props.user.name || "",
		formError: null,
		status: "form",
		submitting: false,
		userId: null,
	};

	constructor(props: IProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitContact = this.submitContact.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);
		this.props.setPageTitle({
			page: "Contact Us",
		});

	}

	componentDidUpdate() {

		if (this.props.user.id !== this.state.userId ) {

			this.setState({
				contactEmail: this.props.user.email || "",
				contactName: this.props.user.name || "",
				userId: this.props.user.id,
			});

		}

	}

	render() {

		return (

			<div className="contact">

				<h1>Contact Us</h1>

				{ this.state.status === "form" ?

					<form
						id="contactForm"
						onSubmit={this.submitContact}
						className={this.state.submitting ? "disabled" : ""}
					>

						<p>Have a question?  Got an error?  Want to help out?  Let us know by filling out the form below</p>

						<div className="inputGroup">
							<label htmlFor="contactName">Name</label>
							<input
								id="contactName"
								name="contactName"
								type="text"
								required={true}
								disabled={this.state.submitting || !!this.props.user.name}
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
								disabled={this.state.submitting || !!this.props.user.email}
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

				: null}

				{ this.state.submitting ?
					<div className="loader" />
				: null}

			</div>
		);

	}

	handleInputChange <T extends keyof IContactState>(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {

		const fieldName: (keyof IContactState) = event.currentTarget.name as (keyof IContactState);
		const newState = {
			[fieldName]: event.currentTarget.value,
		};

		this.setState(newState as { [P in T]: IContactState[P]; });

	}

	submitContact(event: React.MouseEvent<HTMLFormElement>): void {

		event.preventDefault();

		this.setState({
			submitting: true,
		});

		const sendEmail = this.addPromise(sendContactEmail(
			this.state.contactEmail,
			this.state.contactMessage,
			this.state.contactName,
		));

		sendEmail
			.then((result) => {

				this.setState({
					status: "success",
					submitting: false,
				});

			})
			.catch((error) => {

				this.setState({
					formError: "Sorry, something went wrong.  Please try again.",
					status: "form",
					submitting: false,
				});

			})
			.finally(sendEmail.clear);

	}

}
