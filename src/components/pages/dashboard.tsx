import React from "react";

import * as auth from "components/lib/auth";

export default class Dashboard<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.logout = this.logout.bind(this);
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.changePage("faq");
		this.props.setMobileMenuState(false);
	}

	logout(event: React.MouseEvent<HTMLAnchorElement>) {

		auth.logout(this.props, event);

	}

	render() {

		return (

			<div>
				<h1>Dashboard</h1>
				<p>Nothing here yet.</p>

				<p><a href="" onClick={this.logout}>Logout</a></p>
			</div>
		);

	}

}
