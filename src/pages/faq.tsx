import React from "react";
import ReactDOM from "react-dom";

export default class Faq extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
		}
	}

	componentDidMount() {
		window.scrollTo(0,0);
		this.props.changePage("faq");
	}

	render() {

		return (

			<div>
				<h1>Frequently Asked Stuff</h1>
				<p>{this.props.page}</p>
			</div>
		);

	}

}
