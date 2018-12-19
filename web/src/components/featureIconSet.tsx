import React from "react";

import FeatureIcon from "components/featureIcon";

import { IDerbyFeatureType } from "interfaces/feature";

interface IFeatureLabels {
	[key: string]: string[];
}

interface IFeatureSetProps {
	data: IDerbyFeatureType[];
	labels: IFeatureLabels | boolean;
	includeEmpty: boolean;
	selected?: string[];
	toggle?: (event: React.MouseEvent<any>) => void;
}

interface IFeatureSetDefaultProps {
	includeEmpty: boolean;
	labels: boolean;
}

export default class FeatureIconSet extends React.Component<IFeatureSetProps> {

	static defaultProps: IFeatureSetDefaultProps = {
		includeEmpty: false,
		labels: true,
	};

	constructor(props: IFeatureSetProps) {
		super(props);
	}

	render() {

		return(

			this.props.data && this.props.data.length ? (

				<div className="featureIcons">

					{this.props.data.map((featureGroup) => (

						featureGroup.features.length || this.props.includeEmpty ?

							<span className="featureIconGroup" key={featureGroup.code}>

								{this.props.labels === true
									|| (typeof this.props.labels === "object"
										&& this.props.labels[featureGroup.code]
										&& this.props.labels[featureGroup.code].length) ?

									<span className="label">
										{
											this.props.labels === true ?
												featureGroup.features.length === 1 ?
													featureGroup.singular
												: featureGroup.plural
											:
												featureGroup.features.length > 1
													&& this.props.labels[featureGroup.code][1] ?
													this.props.labels[featureGroup.code][1]
												: this.props.labels[featureGroup.code][0]
										}
									</span>

								: null}

								{featureGroup.features.map((item) => (

									<FeatureIcon
										key={item.id}
										feature={item}
										selected={this.props.selected && this.props.toggle ?
											this.props.selected.indexOf(`${featureGroup.code}-${item.id}`) > -1 : false}
										toggle={this.props.toggle || null}
										type={featureGroup.code}
									/>

								))}

							</span>

						: null

					))}

				</div>

			) : null

		);

	}

}
