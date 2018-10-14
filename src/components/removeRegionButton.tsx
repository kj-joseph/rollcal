import React from "react";
import ReactDOM from "react-dom";

export default class RemoveRegionButton<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.removeLocationRegion = this.removeLocationRegion.bind(this);
	}

	removeLocationRegion() {
		this.props.onButtonClick(this.props.region.region_country, this.props.region.region_id);
	}

	render() {

		return(

			<button
				className="smallButton"
				title={"remove" + this.props.region.region_name}
				onClick={this.removeLocationRegion}
			>
				x
			</button>

		);

	}

}
