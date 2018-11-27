import React from "react";
import ReactSVG from "react-svg";

import { IDerbyIcon } from "interfaces/feature";

interface IEventIconImageProps {
	icon: IDerbyIcon;
}

export default class EventIconImage extends React.Component<IEventIconImageProps> {

	constructor(props: IEventIconImageProps) {
		super(props);
	}

	render() {

		return (

			<ReactSVG
				className="icon"
				src={`/images/${this.props.icon.filename}.svg`}
				title={this.props.icon.title}
			/>

		);

	}

}
