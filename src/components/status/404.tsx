import React from "react";

export default class Error404<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		window.scrollTo(0, 0);
	}

	render() {

		return (
			<div>
				<h1>404</h1>
				<h2>Page Not Found</h2>
				<p>Sorry, but we couldn't find that.  Please try another URL or use the menu above to see what we have to offer.</p>
			</div>
		);

	}

}
