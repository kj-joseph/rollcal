import React from "react";
import Select from "react-select";

import { IGeoCountry, IGeoRegion } from "interfaces/geo";

interface IAddressFieldsProps {
	address1?: {
		handler: (prop?: any) => any,
		stateVar: string,
		value: string,
	};
	address2?: {
		handler: (prop?: any) => any,
		stateVar: string,
		value: string,
	};
	city?: {
		handler: (prop?: any) => any,
		stateVar: string,
		value: string,
	};
	country?: {
		handler: (prop?: any) => any,
		label: (option: any) => string,
		list: IGeoCountry[],
		value: IGeoCountry,
	};
	prefix: string;
	postcode?: {
		handler: (prop?: any) => any,
		stateVar: string,
		value: string,
	};
	region?: {
		handler: (prop?: any) => any,
		label: (option: any) => string,
		value: IGeoRegion,
	};
}

export default class AddressForm extends React.Component<IAddressFieldsProps> {

	constructor(props: IAddressFieldsProps) {
		super(props);
	}

	render() {

		return(

			<>

				{this.props.address1 ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__address1`}>Street Address</label>
						<input
							id={`${this.props.prefix}__address1`}
							name={`${this.props.prefix}__address1`}
							data-statevar={this.props.address1.stateVar}
							type="text"
							required={true}
							value={this.props.address1.value}
							onChange={this.props.address1.handler}
						/>
					</div>

				: null}

				{this.props.address2 ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__address2`}>Address line 2 <em>(optional)</em></label>
						<input
							id={`${this.props.prefix}__address2`}
							name={`${this.props.prefix}__address2`}
							data-statevar={this.props.address2.stateVar}
							type="text"
							required={false}
							value={this.props.address2.value}
							onChange={this.props.address2.handler}
						/>
					</div>

				: null}

				{this.props.city ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__city`}>City</label>
						<input
							id={`${this.props.prefix}__city`}
							name={`${this.props.prefix}__city`}
							data-statevar={this.props.city.stateVar}
							type="text"
							required={true}
							value={this.props.city.value}
							onChange={this.props.city.handler}
						/>
					</div>

				: null}

				{this.props.country ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__country`}>Country</label>
						<Select
							id={`${this.props.prefix}__country`}
							name={`${this.props.prefix}__country`}
							className="Select"
							classNamePrefix="Select"
							value={this.props.country.value}
							onChange={this.props.country.handler}
							options={this.props.country.list}
							getOptionLabel={this.props.country.label}
							isSearchable={true}
							isClearable={true}
						/>
					</div>

				: null}

				{this.props.region
					&& this.props.country && this.props.country.value
					&& this.props.country.value.regions && this.props.country.value.regions.length ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__region`}>{this.props.country.value.regionType}</label>
						<Select
							id={`${this.props.prefix}__region`}
							name={`${this.props.prefix}__region`}
							className="Select"
							classNamePrefix="Select"
							value={this.props.region.value}
							onChange={this.props.region.handler}
							options={this.props.country.value.regions}
							getOptionLabel={this.props.region.label}
							isSearchable={true}
							isClearable={true}
						/>
					</div>

				: null}

				{this.props.postcode ?

					<div className="inputGroup">
						<label htmlFor={`${this.props.prefix}__postcode`}>Postal Code <em>(optional)</em></label>
						<input
							id={`${this.props.prefix}__postcode`}
							name={`${this.props.prefix}__postcode`}
							data-statevar={this.props.postcode.stateVar}
							type="text"
							required={false}
							value={this.props.postcode.value}
							onChange={this.props.postcode.handler}
						/>
					</div>

				: null}


			</>

		);

	}

}
