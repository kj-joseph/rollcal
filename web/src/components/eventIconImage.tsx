import React from "react";
import ReactSVG from "react-svg";

import { IDerbyFeature } from "interfaces/feature";

interface IEventIconImageProps {
	feature: IDerbyFeature;
	type: string;
}

export default class EventIconImage extends React.Component<IEventIconImageProps> {

	constructor(props: IEventIconImageProps) {
		super(props);
	}

	render() {

		return (

			<ReactSVG
				className="icon"
				src={`/images/${this.props.feature.abbreviation}.svg`}
				title={this.props.icon.title}
			/>

		);

	}

}
