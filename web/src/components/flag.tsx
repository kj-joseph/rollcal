import React from "react";

import { IGeoCountry } from "interfaces/geo";

interface IFlagProps {
	country: IGeoCountry;
}

export default class Flag extends React.Component<IFlagProps> {

	constructor(props: IFlagProps) {
		super(props);
	}

	render() {

		return (

			<span
				title={this.props.country.name}
				className={`flag-icon flag-icon-${this.props.country.flag}`}
			/>


		);

	}



}
