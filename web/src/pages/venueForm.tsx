import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IDerbyVenue, IDerbyVenueChangeObject } from "interfaces/venue";

import { getGeography } from "services/geoService";
import { getTimeZones } from "services/timeService";
import { checkUserRole } from "services/userService";
import { saveVenueChange } from "services/venueChangeService";
import { getVenueDetails } from "services/venueService";

import AddressFields from "components/addressFields";
import Callout from "components/callout";

import Select from "react-select";

interface IVenueFormState {
	countryList: IGeoCountry[];
	dataError: boolean;
	initialVenueData: IDerbyVenue;
	loading: boolean;
	pageFunction: string;
	path: string;
	processing: boolean;
	submitError: string;
	submitSuccess: boolean;
	timeZoneList: ITimeZone[];
	userId: number;
	venueData: IDerbyVenue;
}

export default class VenueForm extends RCComponent<IProps> {

	state: IVenueFormState = {
		countryList: [],
		dataError: false,
		initialVenueData: {} as IDerbyVenue,
		loading: true,
		pageFunction: this.props.match.params.operation === "add" ? "Add New Venue" :
			this.props.match.params.operation === "edit"
				&& this.props.match.params.venueId
				&& this.props.match.params.venueId.match(/[0-9]+/)
				? "Edit Venue" : "Error",
		path: null,
		processing: false,
		submitError: null,
		submitSuccess: false,
		timeZoneList: [],
		userId: null,
		venueData: {} as IDerbyVenue,
	};

	constructor(props: IProps) {
		super(props);

		this.handleCountryChange = this.handleCountryChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleRegionChange = this.handleRegionChange.bind(this);
		this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
		this.submitVenueForm = this.submitVenueForm.bind(this);
	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path
			|| this.props.user.id !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.user.id,
			});

			if (this.props.user.id && this.state.pageFunction !== "Error") {
				this.loadData();
			} else {
				this.setState({
					dataError: true,
					loading: false,
				});
			}

		}

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: this.props.match.params.operation === "add" ? "Add New Venue" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.eventId
					&& this.props.match.params.eventId.match(/[0-9]+/)
					? "Edit Venue" : "",
			page: "User Dashboard",
		});

	}

	render() {

		return (
			<div className="venueForm">

				<p className="backToLink">
					<Link to="/dashboard/venues">
						&laquo; Back to your venues
					</Link>
				</p>

				<div>

					<h1>{this.state.pageFunction}</h1>

					{this.state.loading || this.state.processing ?

						<div className="loader" />

					: this.state.submitSuccess ?

						( this.state.venueData.id ?

							<>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your changes to this venue have been submitted.  Once one of our crack staff reviews your changes, we'll let you know.  Thanks for your help!</p>
							</>

						:

							<>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your new venue has been submitted.  Once one of our crack staff reviews it, we'll let you know.  Thanks for your help!</p>
							</>

						)

					: this.state.dataError ?

						<div>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<>

							<Callout title="Important!">
								<p>
									Changes made to this venue will show on <em>all</em> events that list this venue.
									Don't use this to change the venue of an event; edit the event instead.
								</p>
							</Callout>

							<form
								className="entryForm"
								id="venueForm"
								onSubmit={this.submitVenueForm}
							>

								<div className="formSection">

									<div className="inputGroup">
										<label htmlFor="name">Name</label>
										<input
											id="name"
											name="name"
											data-statevar="name"
											type="text"
											required={true}
											value={this.state.venueData.name}
											onChange={this.handleInputChange}
										/>
									</div>

									<AddressFields
										prefix="address"
										address1={({
											handler: this.handleInputChange,
											stateVar: "address1",
											value: this.state.venueData.address1,
										})}
										address2={({
											handler: this.handleInputChange,
											stateVar: "address2",
											value: this.state.venueData.address2,
										})}
										city={({
											handler: this.handleInputChange,
											stateVar: "city",
											value: this.state.venueData.city,
										})}
										country={({
											handler: this.handleCountryChange,
											label: this.getCountryOptionLabel,
											list: this.state.countryList,
											value: this.state.venueData.country,
										})}
										region={({
											handler: this.handleRegionChange,
											label: this.getRegionOptionLabel,
											value: this.state.venueData.region,
										})}
										postcode={({
											handler: this.handleInputChange,
											stateVar: "postcode",
											value: this.state.venueData.postcode,
										})}
									/>

									<div className="inputGroup selectTimeZone">
										<label htmlFor="timezone">Time Zone</label>
										<Select
											id="timezone"
											name="timezone"
											className="Select"
											classNamePrefix="Select"
											value={this.state.venueData.timezone}
											onChange={this.handleTimeZoneChange}
											options={this.state.timeZoneList}
											getOptionLabel={this.getTimeZoneLabel}
											isSearchable={true}
											isClearable={true}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="link">Website <em>(optional)</em></label>
										<input
											id="link"
											name="link"
											data-statevar="link"
											type="url"
											required={false}
											value={this.state.venueData.link}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="description">Description <em>(optional)</em></label>
										<textarea
											id="description"
											name="description"
											data-statevar="description"
											required={false}
											value={this.state.venueData.description}
											onChange={this.handleInputChange}
										/>
									</div>

								</div>

								{ this.state.submitError ?
									<p className="error">{this.state.submitError}</p>
								: null}

								<div className="buttonRow">
									<button
										type="submit"
										disabled={
											!this.state.venueData.name
											|| !this.state.venueData.address1
											|| !this.state.venueData.city
											|| !this.state.venueData.country.code
											|| !this.state.venueData.timezone
										}
										className="largeButton"
									>
										Save {this.props.match.params.venueId ? "Changes" : "New Venue"}
									</button>
								</div>

							</form>

						</>

					}

				</div>
			</div>
		);

	}

	getCountryOptionLabel(option: IGeoCountry): string {

		return option.name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion): string {

		return option.name || "(type here to search list)";

	}

	getTimeZoneLabel(option: ITimeZone): string {

		return option.name || "(type here to search list)";

	}

	handleCountryChange(country: IGeoCountry): void {

		const venueData = Object.assign(this.state.venueData, {
			country: country || {} as IGeoCountry,
			region: {} as IGeoRegion,
		});

		this.setState({
			venueData,
		});

	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {

		const venueData = this.state.venueData;
		const fieldName: (keyof IDerbyVenue) =
			event.currentTarget.dataset.statevar ?
				event.currentTarget.dataset.statevar as keyof IDerbyVenue
			: event.currentTarget.name as keyof IDerbyVenue;
		venueData[fieldName] = event.currentTarget.value;

		this.setState({
			venueData,
		});

	}

	handleRegionChange(region: IGeoRegion): void {

		const venueData = Object.assign(this.state.venueData, {
			region: region || {} as IGeoRegion,
		});

		this.setState({
			venueData,
		});

	}

	handleTimeZoneChange(timezone: ITimeZone): void {

		const venueData = Object.assign(this.state.venueData, {
			timezone: timezone || {} as ITimeZone,
		});

		this.setState({
			selectedTimeZone: timezone || {} as ITimeZone,
			venueData,
		});

	}

	loadData(): void {

		const dataPromises: Array<Promise<any>> = [
			getGeography(),
			getTimeZones(),
		];

		if (this.props.match.params.venueId) {
			dataPromises.push(getVenueDetails(this.props.match.params.venueId));
		}

		const loadData = this.addPromise(
			Promise.all(dataPromises));

		loadData
			.then((data: [
				IGeoCountry[],
				ITimeZone[],
				IDerbyVenue
			]) => {

				const [
					countryList,
					timeZoneList,
					venueData,
				]
					= data;

				let initialVenueData: IDerbyVenue = {
					address1: "",
					address2: "",
					city: "",
					country: {} as IGeoCountry,
					description: "",
					id: null,
					link: "",
					name: "",
					postcode: "",
					region: {} as IGeoRegion,
					timezone: {} as ITimeZone,
				};

				if (this.props.match.params.venueId) {

					let countryObject = {} as IGeoCountry;
					let regionObject = {} as IGeoRegion;

					if (venueData.country && venueData.country.code) {
						countryObject = countryList.filter((country) =>
				 			country.code === venueData.country.code)[0];
					}

					if (venueData.region && venueData.region.id
			 			&& countryObject.regions && countryObject.regions.length) {
						regionObject = countryObject.regions.filter((region) =>
							region.id === venueData.region.id)[0];
					}

					initialVenueData = {
						address1: venueData.address1 || "",
						address2: venueData.address2 || "",
						city: venueData.city || "",
						country: countryObject,
						description: venueData.description || "",
						id: venueData.id,
						link: venueData.link || "",
						name: venueData.name || "",
						postcode: venueData.postcode || "",
						region: regionObject,
						timezone: venueData.timezone || {} as ITimeZone,
					};

				}

				this.setState({
					countryList,
					initialVenueData: Object.assign({}, initialVenueData),
					loading: false,
					timeZoneList,
					venueData: Object.assign({}, initialVenueData),
				});

			})
			.catch((error) => {

				console.error(error);

			})
			.finally(loadData.clear);

	}

	submitVenueForm(event: React.MouseEvent<HTMLFormElement>): void {

		event.preventDefault();

		this.setState({
			processing: true,
		});

		const dataChanges: IDerbyVenueChangeObject = {};

		for (const field in this.state.venueData) {
			if (field === "id") {
				continue;
			}
			const fieldName: (keyof IDerbyVenueChangeObject) = field as (keyof IDerbyVenueChangeObject);

			const initialValue =
				fieldName === "country" ?
					this.state.initialVenueData.country.code
				: fieldName === "region" || fieldName === "timezone" ?
					this.state.initialVenueData[fieldName].id
				:
					this.state.initialVenueData[fieldName] || undefined;

			const savedValue =
				fieldName === "country" ?
					this.state.venueData.country.code
				: fieldName === "region" || fieldName === "timezone" ?
					this.state.venueData[fieldName].id
				:
					this.state.venueData[fieldName] || undefined;

			if ((!this.state.venueData.id && savedValue)
				|| (this.state.venueData.id && savedValue !== initialValue)) {
				dataChanges[fieldName] = savedValue;
			}

		}

		if (Object.keys(dataChanges).length) {

			const saveChanges = this.addPromise(
				saveVenueChange(dataChanges, this.state.venueData.id || 0));

			saveChanges
				.then(() => {

					this.setState({
						processing: false,
						submitSuccess: true,
					});


				}).catch((error) => {

					this.setState({
						processing: false,
						submitError: "There was an error submitting your changes. Please try again.",
					});

				});

		} else {

			this.setState({
				processing: false,
				submitError: "You haven't made any changes.",
			});

		}

	}

}
