import React from "react";
import ReactSVG from "react-svg";

export default class FeatureIcon<Props> extends React.Component<any, any, any> {

	constructor(props: {
		abbreviation: string,
		alt: string,
		className: string,
		featureType: string,
		title: string;
	}) {
		super(props);

		this.toggleIcon = this.toggleIcon.bind(this);
	}

	toggleIcon() {

		this.props.toggleFunction(`${this.props.featureType}-${this.props.id.toString()}`);

	}

	render() {

		return(

			<ReactSVG
				className={`featureIcon ${this.props.imageClass}`}
				src={`/images/${this.props.featureType}-${this.props.abbreviation}.svg`}
				onClick={this.toggleIcon}
			/>

		);

	}

}
