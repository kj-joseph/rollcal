import React from "react";

import Modal from "react-modal";
Modal.setAppElement("#root");

import * as auth from "components/lib/auth";

export default class Dashboard<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
		};

		this.logout = this.logout.bind(this);
		this.openAccountModal = this.openAccountModal.bind(this);
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.changePage("faq");
		this.props.setMobileMenuState(false);
	}

	openAccountModal(event: React.MouseEvent<HTMLButtonElement>) {

		this.props.setAccountModalState(true);

	}

	logout(event: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

	render() {

		return (

			<React.Fragment>

				<div className="dashboard">

					<h1>Hi, {this.props.loggedInUserName}!</h1>
					<div className="buttonRow">
						<button type="button" onClick={this.openAccountModal} className="largeButton">Account</button>
						<button type="button" onClick={this.logout} className="largeButton pinkButton">Log out</button>
					</div>


					<div className="userEventList">
						<h2>Your Events</h2>
					</div>

				</div>

			</React.Fragment>

		);

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {

		const formId: string = (this.state.status === "login" ? "loginForm" : this.state.status === "register" ? "registerForm" : null);

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
			formValid: (document.getElementById(formId) as HTMLFormElement).checkValidity(),
		});
	}

}
