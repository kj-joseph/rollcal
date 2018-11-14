import React from "react";

export default class Faq<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
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
			</div>
		);

	}

}
