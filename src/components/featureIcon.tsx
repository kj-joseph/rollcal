import React from "react";
import ReactDOM from "react-dom";

export default class FeatureIcon<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.toggleIcon = this.toggleIcon.bind(this);
	}

	toggleIcon() {

		this.props.toggleFunction(`${this.props.featureType}-${this.props.id.toString()}`);

	}

	render() {

		return(

			<img
				className={this.props.imageClass}
				src={`/images/${this.props.featureType}-${this.props.abbreviation}.svg`}
				title={this.props.title}
				alt={this.props.name}
				onClick={this.toggleIcon}
			/>

		);

	}

}
