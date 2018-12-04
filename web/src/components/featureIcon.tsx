import React from "react";
import ReactSVG from "react-svg";

import { IDerbyFeature } from "interfaces/feature";

interface IFeatureIconProps {
	feature: IDerbyFeature;
	selected?: boolean;
	toggle?: (event: React.MouseEvent<any>) => void;
	type: string;
}

export default class FeatureIcon extends React.Component<IFeatureIconProps> {

	constructor(props: IFeatureIconProps) {
		super(props);

	}

	render() {

		return(

			<ReactSVG
				className={`featureIcon${this.props.selected ? " selected" : ""}`}
				data-feature={`${this.props.type}-${this.props.feature.id}`}
				onClick={this.props.toggle ? this.props.toggle : null}
				src={`/images/${this.props.type}-${this.props.feature.abbreviation}.svg`}
				title={this.props.feature.name}
			/>

		);

	}

}
