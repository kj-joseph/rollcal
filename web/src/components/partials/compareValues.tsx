import React from "react";

interface ICompareValuesProps {
	inline?: boolean;
	label?: string;
	newValue: any;
	oldValue: any;
	omitIfEmpty?: boolean;
}

export default class CompareValues extends React.Component<ICompareValuesProps> {

	constructor(props: ICompareValuesProps) {
		super(props);
	}

	render() {

		if (!this.props.oldValue && !this.props.newValue) {

			if (this.props.inline || this.props.omitIfEmpty) {
				return "";
			} else {
				return (
					<React.Fragment>
						<dt>{this.props.label}:</dt>
						<dd><span className="nodata">(none)</span></dd>
					</React.Fragment>
				);
			}

		} else if (!this.props.oldValue && this.props.newValue) {

			if (this.props.inline) {
				return (
					<React.Fragment>
						<span className="new">{this.props.newValue}</span>
					</React.Fragment>
				);
			} else {
				return (
					<React.Fragment>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="new">{this.props.newValue}</span>
						</dd>
					</React.Fragment>
				);
			}

		} else if (this.props.oldValue && this.props.newValue === undefined) {

			if (this.props.inline) {
				return (
					<React.Fragment>
						<span className="old">{this.props.oldValue}</span>
					</React.Fragment>
				);
			} else {
				return (
					<React.Fragment>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="old">{this.props.oldValue}</span>
						</dd>
					</React.Fragment>
				);
			}

		} else if (this.props.oldValue && this.props.newValue === null) {

			if (this.props.inline) {
				return (
					<React.Fragment>
						<span className="old removed">{this.props.oldValue}</span>
					</React.Fragment>
				);
			} else {
				return (
					<React.Fragment>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="old removed">{this.props.oldValue}</span>
						</dd>
					</React.Fragment>
				);
			}

		} else if (this.props.oldValue && this.props.newValue) {

			if (this.props.oldValue === this.props.newValue)  {

				if (this.props.inline) {
					return (
						<React.Fragment>
							<span className="old">{this.props.oldValue}</span>
						</React.Fragment>
					);
				} else {
					return (
						<React.Fragment>
							<dt>{this.props.label}:</dt>
							<dd>
								<span className="old">{this.props.oldValue}</span><br />
							</dd>
						</React.Fragment>
					);
				}

			} else {

				if (this.props.inline) {
					return (
						<React.Fragment>
							<span className="old removed">{this.props.oldValue}</span> <span className="new">{this.props.newValue}</span>
						</React.Fragment>
					);
				} else {
					return (
						<React.Fragment>
							<dt>{this.props.label}:</dt>
							<dd>
								<span className="old removed">{this.props.oldValue}</span><br />
								<span className="new">{this.props.newValue}</span>
							</dd>
						</React.Fragment>
					);
				}

			}
		}

	}

}
