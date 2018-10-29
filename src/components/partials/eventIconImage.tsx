import React from "react";
import ReactSVG from "react-svg";

export default class EventIconImage<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
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
