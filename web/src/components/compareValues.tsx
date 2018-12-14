import React from "react";
import FormatText from "react-format-text";

interface ICompareValuesProps {
	addFormatting?: boolean;
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
					<>
						<dt>{this.props.label}:</dt>
						<dd><span className="nodata">(none)</span></dd>
					</>
				);
			}

		} else if (!this.props.oldValue && this.props.newValue) {

			if (this.props.inline) {
				return (
					<>
						<span className="new">
							{ this.props.addFormatting ?
								<FormatText>{this.props.newValue}</FormatText>
							: this.props.newValue}
						</span>
					</>
				);
			} else {
				return (
					<>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="new">
								{ this.props.addFormatting ?
									<FormatText>{this.props.newValue}</FormatText>
								: this.props.newValue}
							</span>
						</dd>
					</>
				);
			}

		} else if (this.props.oldValue && this.props.newValue === undefined) {

			if (this.props.inline) {
				return (
					<>
						<span className="old">
							{ this.props.addFormatting ?
								<FormatText>{this.props.oldValue}</FormatText>
							: this.props.oldValue}
						</span>
					</>
				);
			} else {
				return (
					<>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="old">
								{ this.props.addFormatting ?
									<FormatText>{this.props.oldValue}</FormatText>
								: this.props.oldValue}
							</span>
						</dd>
					</>
				);
			}

		} else if (this.props.oldValue && this.props.newValue === null) {

			if (this.props.inline) {
				return (
					<>
						<span className="old removed">
							{ this.props.addFormatting ?
								<FormatText>{this.props.oldValue}</FormatText>
							: this.props.oldValue}
						</span>
					</>
				);
			} else {
				return (
					<>
						<dt>{this.props.label}:</dt>
						<dd>
							<span className="old removed">
								{ this.props.addFormatting ?
									<FormatText>{this.props.oldValue}</FormatText>
								: this.props.oldValue}
							</span>
						</dd>
					</>
				);
			}

		} else if (this.props.oldValue && this.props.newValue) {

			if (this.props.oldValue === this.props.newValue)  {

				if (this.props.inline) {
					return (
						<span className="old">
							{ this.props.addFormatting ?
								<FormatText>{this.props.oldValue}</FormatText>
							: this.props.oldValue}
						</span>
					);
				} else {
					return (
						<>
							<dt>{this.props.label}:</dt>
							<dd>
								<span className="old">
									{ this.props.addFormatting ?
										<FormatText>{this.props.oldValue}</FormatText>
									: this.props.oldValue}
								</span>
							</dd>
						</>
					);
				}

			} else {

				if (this.props.inline) {
					return (
						<>
							<span className="old removed">
								{ this.props.addFormatting ?
									<FormatText>{this.props.oldValue}</FormatText>
								: this.props.oldValue}
							</span>{" "}
							<span className="new">
								{ this.props.addFormatting ?
									<FormatText>{this.props.newValue}</FormatText>
								: this.props.newValue}
							</span>
						</>
					);
				} else {
					return (
						<>
							<dt>{this.props.label}:</dt>
							<dd>
							<span className="old removed">
								{ this.props.addFormatting ?
									<FormatText>{this.props.oldValue}</FormatText>
								: this.props.oldValue}
							</span><br />
							<span className="new">
								{ this.props.addFormatting ?
									<FormatText>{this.props.newValue}</FormatText>
								: this.props.newValue}
							</span>
							</dd>
						</>
					);
				}

			}
		}

	}

}
