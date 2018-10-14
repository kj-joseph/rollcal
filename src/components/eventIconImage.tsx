import React from "react";
import ReactDOM from "react-dom";

import { IDerbyIcon } from "interfaces";

export class EventIconImage<Props> extends React.Component<any, any, any> {

	constructor(props: {icon: IDerbyIcon}) {
		super(props);
	}

	render() {

		return (
			<img src={`/images/${this.props.icon.filename}.svg`} title={this.props.icon.title} alt={this.props.icon.title} />
		);

	}

}
