import React from "react";

interface ICalloutProps {
	title: string;
}

export default class Callout extends React.Component<ICalloutProps> {

	constructor(props: ICalloutProps) {
		super(props);
	}

	render() {

		return(

			<div className="callout">
				<p className="header">{this.props.title}</p>
				{this.props.children}
			</div>

		);

	}

}
