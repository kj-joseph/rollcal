import React from "react";
import ReactSVG from "react-svg";

interface IFeatureIconProps {
	abbreviation: string;
	featureType: string;
	id: number;
	imageClass: string;
	title: string;
	toggleFunction: (icon: string) => void;
}

export default class FeatureIcon extends React.Component<IFeatureIconProps> {

	constructor(props: IFeatureIconProps) {
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
				onClick={this.toggleIcon}
				src={`/images/${this.props.featureType}-${this.props.abbreviation}.svg`}
				title={this.props.title}
			/>

		);

	}

}
