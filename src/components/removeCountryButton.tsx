import React from "react";
import ReactDOM from "react-dom";

export default class RemoveCountryButton<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.removeLocationCountry = this.removeLocationCountry.bind(this);
	}

	removeLocationCountry() {
		this.props.onButtonClick(this.props.country.country_code);
	}

	render() {

		return(

			<button
				className="smallButton"
				title={"remove" + this.props.country.country_name}
				onClick={this.removeLocationCountry}
			>
				x
			</button>

		);

	}

}
