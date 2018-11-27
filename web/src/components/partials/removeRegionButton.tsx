import React from "react";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IRemoveCountryButtonProps {
	country: string;
	id: number;
	name: string;
	onButtonClick: (countryCode: string, regionId?: number) => void;
}

export default class RemoveRegionButton extends React.Component<IRemoveCountryButtonProps> {

	constructor(props: IRemoveCountryButtonProps) {
		super(props);

		this.removeLocationRegion = this.removeLocationRegion.bind(this);
	}

	removeLocationRegion() {
		this.props.onButtonClick(this.props.country, this.props.id);
	}

	render() {

		return(

			<ReactSVG
				className="removeGeoButton"
				src={CloseIcon}
				title={`remove ${this.props.name}`}
				onClick={this.removeLocationRegion}
			/>

		);

	}

}
