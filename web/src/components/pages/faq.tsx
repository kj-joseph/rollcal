import React from "react";

import { IProps } from "interfaces/redux";

interface IFaqState {
	TBD: any;
}

export default class Faq extends React.Component<IProps, IFaqState> {

	mounted: boolean;

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
				<h1>Frequently Asked Stuff</h1>
				<p>(missing)</p>
			</div>
		);

	}

}
