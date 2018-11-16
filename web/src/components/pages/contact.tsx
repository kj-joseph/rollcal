import React from "react";

import { IProps } from "interfaces/redux";

interface IContactState {
	TBD: any;
}

export default class Contact extends React.Component<IProps, IContactState> {

	mounted = false;

	constructor(props: IProps) {
		super(props);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	render() {

		return (

			<div>
				<h1>Contact Us</h1>
				<p>(missing)</p>
			</div>
		);

	}

}
