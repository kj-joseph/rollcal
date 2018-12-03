import React from "react";
import ReactSVG from "react-svg";

import { IDerbyFeature } from "interfaces/feature";

interface IFeatureIconProps {
	feature: IDerbyFeature;
	type: string;
	selected?: boolean;
	toggleFunction?: (icon: string) => void;
}

export default class FeatureIcon extends React.Component<IFeatureIconProps> {

	constructor(props: IFeatureIconProps) {
		super(props);

		this.toggleIcon = this.toggleIcon.bind(this);
	}

	toggleIcon() {

		this.props.toggleFunction(`${this.props.type}-${this.props.feature.id.toString()}`);

	}

	render() {

		return(

			<ReactSVG
				className={`featureIcon${this.props.selected ? " selected" : ""}`}
				onClick={this.props.toggleFunction ? this.toggleIcon : null}
				src={`/images/${this.props.type}-${this.props.feature.abbreviation}.svg`}
				title={this.props.feature.name}
			/>

		);

	}

}
