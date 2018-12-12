import React from "react";

import FeatureIcon from "components/featureIcon";

import { IDerbyFeature } from "interfaces/feature";

interface IFeatureData {
	items: IDerbyFeature[];
	label?: string | {
		plural: string,
		singular: string,
	};
	type: string;
}

interface IFeatureSetProps {
	data: IFeatureData[];
	includeEmpty: boolean;
	selected?: string[];
	toggle?: (event: React.MouseEvent<any>) => void;
}

interface IFeatureSetDefaultProps {
	includeEmpty: boolean;
}

export default class FeatureIconSet extends React.Component<IFeatureSetProps> {

	static defaultProps: IFeatureSetDefaultProps = {
		includeEmpty: false,
	};

	constructor(props: IFeatureSetProps) {
		super(props);
	}

	render() {

		return(

			this.props.data && this.props.data.length ?

				<div className="featureIcons">

					{this.props.data.map((featureGroup) => (

						featureGroup.items.length || this.props.includeEmpty ?

							<span className="featureIconGroup" key={featureGroup.type}>

								{featureGroup.label ?

									<span className="label">
										{typeof featureGroup.label === "string" ?
											featureGroup.label
										: featureGroup.label.singular && featureGroup.label.plural ?
											featureGroup.items.length === 1 ?
												featureGroup.label.singular
												: featureGroup.label.plural
											: featureGroup.label.singular ?
												featureGroup.label.singular
											: featureGroup.label.plural ?
												featureGroup.label.plural
											: ""
										}


									</span>

								: ""}

								{featureGroup.items.map((item) => (

									<FeatureIcon
										key={item.id}
										feature={item}
										selected={this.props.selected && this.props.toggle ?
											this.props.selected.indexOf(`${featureGroup.type}-${item.id}`) > -1 : false}
										toggle={this.props.toggle || null}
										type={featureGroup.type}
									/>

								))}

							</span>

						: ""

					))}

				</div>

			: null

		);

	}

}
