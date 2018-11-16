import React from "react";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IRemoveCountryButtonProps {
	code: string;
	name: string;
	onButtonClick: (countryCode: string, regionId?: number) => void;
}

export default class RemoveCountryButton extends React.Component<IRemoveCountryButtonProps> {

	constructor(props: IRemoveCountryButtonProps) {
		super(props);

		this.removeLocationCountry = this.removeLocationCountry.bind(this);
	}

	removeLocationCountry() {
		this.props.onButtonClick(this.props.code);
	}

	render() {

		return(

			<ReactSVG
				className="removeGeoButton"
				src={CloseIcon}
				title={`remove ${this.props.name}`}
				onClick={this.removeLocationCountry}
			/>

		);

	}

}
