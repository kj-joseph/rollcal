import React from "react";

interface IFormSectionProps {
	checked?: boolean;
	count?: number;
	label: string;
	name?: string;
	status?: boolean;
	toggle?: (event: React.MouseEvent<any>) => void;
}

export default class FeatureIcon extends React.Component<IFormSectionProps> {

	constructor(props: IFormSectionProps) {
		super(props);
	}

	render() {

		return(

			<div
				className={"formSection"
					+ (this.props.toggle ?
						this.props.status ? " open" : " closed"
						: "")
					+ (this.props.checked ? " ok" : "")
					+ (this.props.toggle ? "" : " noOpener")}
			>

				<h3
					className="formSectionHeader"
					data-section={this.props.name}
					onClick={this.props.toggle ? this.props.toggle : null}
				>
					<span>{this.props.label}</span>
						{this.props.count || this.props.count === 0 ?
							` (${this.props.count})`
						: null}
				</h3>

				<div className="formSectionContent">

					{this.props.children}

				</div>

			</div>

		);

	}

}
