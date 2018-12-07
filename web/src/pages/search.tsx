import RCComponent from "components/rcComponent";
import React from "react";
import Select from "react-select";

import { IDerbyFeature, IDerbyFeatures } from "interfaces/feature";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";

import { DayPickerRangeController, FocusedInputShape } from "react-dates";
import "react-dates/initialize";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes } from "services/featureService";
import { getGeography } from "services/geoService";
import { formatDateRange } from "services/timeService";

import FeatureIconSet from "components/featureIconSet";
import Flag from "components/flag";

import moment from "moment";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IStartState {
	address1?: string;
	addressCity?: string;
	addressCountry?: IGeoCountry;
	addressPostal?: string;
	addressRegion?: IGeoRegion;
	dateRangeDisplay?: string;
	distanceUnits?: "mi" | "km";
	endDate?: moment.Moment;
	loading: boolean;
	locationTab?: "distance" | "locations" | "none";
	searchDistance?: number;
	selectedFeatures?: string[];
	selectedLocations?: IGeoCountry[];
	startDate?: moment.Moment;
}

interface ISearchState {
	address1: string;
	addressCity: string;
	addressCountry: IGeoCountry;
	addressPostal: string;
	addressRegion: IGeoRegion;
	countryList: IGeoCountry[];
	countrySelectValue: IGeoCountry;
	dateRangeDisplay: string;
	distanceUnits: "mi" | "km";
	endDate: moment.Moment;
	eventFeatures: IDerbyFeatures;
	focusedInput: FocusedInputShape;
	loading: boolean;
	locationTab: "distance" | "locations" | "none";
	path: string;
	regionSelectValue: IGeoRegion;
	searchDistance: number;
	selectedFeatures: string[];
	selectedLocations: IGeoCountry[];
	startDate: moment.Moment;
}

export default class Search extends RCComponent<IProps> {

	state: ISearchState = {
		address1: "",
		addressCity: "",
		addressCountry: {} as IGeoCountry,
		addressPostal: "",
		addressRegion: {} as IGeoRegion,
		countryList: [],
		countrySelectValue: {} as IGeoCountry,
		dateRangeDisplay: formatDateRange({
			start: moment(),
		}),
		distanceUnits: "mi",
		endDate: null,
		eventFeatures: {} as IDerbyFeatures,
		focusedInput: "startDate",
		loading: true,
		locationTab: "none",
		path: null,
		regionSelectValue: {} as IGeoRegion,
		searchDistance: 0,
		selectedFeatures: [],
		selectedLocations: [],
		startDate: null,
	};

	constructor(props: IProps) {
		super(props);

		this.addCountry = this.addCountry.bind(this);
		this.addRegion = this.addRegion.bind(this);
		this.changeCountrySelect = this.changeCountrySelect.bind(this);
		this.changeLocationTab = this.changeLocationTab.bind(this);
		this.changeRegionSelect = this.changeRegionSelect.bind(this);
		this.changeUnits = this.changeUnits.bind(this);
		this.clearDates = this.clearDates.bind(this);
		this.determineStartMonth = this.determineStartMonth.bind(this);
		this.getCountryOptionLabel = this.getCountryOptionLabel.bind(this);
		this.getRegionOptionLabel = this.getRegionOptionLabel.bind(this);
		this.handleAddressCountryChange = this.handleAddressCountryChange.bind(this);
		this.handleAddressRegionChange = this.handleAddressRegionChange.bind(this);
		this.handleFocusChange = this.handleFocusChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.isBeforeToday = this.isBeforeToday.bind(this);
		this.isCountryOptionDisabled = this.isCountryOptionDisabled.bind(this);
		this.isRegionOptionDisabled = this.isRegionOptionDisabled.bind(this);
		this.loadData = this.loadData.bind(this);
		this.onDatesChange = this.onDatesChange.bind(this);
		this.removeCountry = this.removeCountry.bind(this);
		this.removeRegion = this.removeRegion.bind(this);
		this.renderMonthHeader = this.renderMonthHeader.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			page: "Search Events",
		});

	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			this.setState({
				path: window.location.pathname,
			});
			this.loadData();

		}
	}

	render() {

		return (

			<React.Fragment>
				<h1>Search Events</h1>

				{ this.state.loading ?
					<div className="loader" />
				:
					<React.Fragment>
						<div className="searchForm">
							<div className="searchDatesLocations">

								<div className="searchDates">
									<p className="dateRange">
										<strong>Filter by Date:</strong>
										{this.state.dateRangeDisplay}
										{(this.state.dateRangeDisplay || this.state.startDate) && !this.state.endDate ? " – (all)" : ""}
										{this.state.startDate && this.state.endDate && this.state.startDate.format("Y-MM-DD") === this.state.endDate.format("Y-MM-DD") ? " (only)" : ""}
										{this.state.startDate ?
											<React.Fragment>
												<br />
												<button className="smallButton" onClick={this.clearDates}>Clear dates</button>
											</React.Fragment>
										: ""}
									</p>

									<DayPickerRangeController
										startDate={this.state.startDate}
										endDate={this.state.endDate}
										focusedInput={this.state.focusedInput}
										hideKeyboardShortcutsPanel={true}
										numberOfMonths={1}
										enableOutsideDays={false}
										initialVisibleMonth={this.determineStartMonth}
										isOutsideRange={this.isBeforeToday}
										keepOpenOnDateSelect={true}
										minimumNights={0}
										onDatesChange={this.onDatesChange}
										onFocusChange={this.handleFocusChange}
										renderMonthElement={this.renderMonthHeader}
									/>

								</div>

								<p className="locationTabs">
									<strong>Filter Location by:</strong><br />
									<span
										className={this.state.locationTab === "locations" ? "activeTab" : ""}
										data-tab="locations"
										onClick={this.changeLocationTab}
									>
										Country/Region
									</span>
									<span
										className={this.state.locationTab === "distance" ? "activeTab" : ""}
										data-tab="distance"
										onClick={this.changeLocationTab}
									>
										Distance
									</span>
									<span
										className={this.state.locationTab === "none" ? "activeTab" : ""}
										data-tab="none"
										onClick={this.changeLocationTab}
									>
										None
									</span>
								</p>

								{this.state.locationTab === "locations" ?

									<div className="searchLocations">

										<p className="info">
											To search events by country or region (e.g., state or province), search below then click the button to add to your filter list.
										</p>

										<div className="formInput">
											<label htmlFor="searchSelectCountries">Select a country:</label>
											<Select
												className="Select searchSelectCountries"
												classNamePrefix="Select"
												id="searchSelectCountries"
												name="searchSelectCountries"
												value={this.state.countrySelectValue}
												onChange={this.changeCountrySelect}
												options={this.state.countryList}
												isOptionDisabled={this.isCountryOptionDisabled}
												getOptionLabel={this.getCountryOptionLabel}
												isSearchable={true}
												isClearable={true}
											/>
										</div>

										{this.state.countrySelectValue && this.state.countrySelectValue.code ?
											<div className="locationButton">
												<button
													className="smallButton"
													disabled={!this.state.countrySelectValue
														|| !this.state.countrySelectValue.name
														|| !!this.state.selectedLocations
															.filter((country) => country.code === this.state.countrySelectValue.code).length
													}
													onClick={this.addCountry}
												>
													Add {this.state.countrySelectValue ? this.state.countrySelectValue.name : ""} to Location List
												</button>
											</div>
										: ""}

										{(this.state.countrySelectValue
											&& this.state.countrySelectValue.regions
											&& this.state.countrySelectValue.regions.length) ?

											<React.Fragment>
												<div className="formInput">
													<label htmlFor="searchSelectRegions">or select a {this.state.countrySelectValue.regionType}:</label>

													<Select
														className="Select searchSelectRegions"
														classNamePrefix="Select"
														id="searchSelectRegions"
														name="searchSelectRegions"
														value={this.state.regionSelectValue}
														onChange={this.changeRegionSelect}
														options={this.state.countrySelectValue.regions}
														isOptionDisabled={this.isRegionOptionDisabled}
														getOptionLabel={this.getRegionOptionLabel}
														isSearchable={true}
														isClearable={true}
													/>

												</div>

												<div className="locationButton">
													<button
														className="smallButton"
														disabled={!this.state.regionSelectValue ||
															!this.state.regionSelectValue.id}
														onClick={this.addRegion}
													>
														Add {this.state.regionSelectValue ? this.state.regionSelectValue.name : ""} to Location List
													</button>
												</div>

											</React.Fragment>

										: ""}

										<div className="selectedLocationsContainer">

											<p className="selectedLocationsHeader">Selected Locations</p>

											<ul className="selectedLocations">
												{!this.state.selectedLocations.length ?
													<li>All</li>
												:
													<React.Fragment>
														{this.state.selectedLocations.sort((a, b) => {
															if (a.name < b.name) {
																return -1;
															} else if (a.name > b.name) {
																return 1;
															} else {
																return 0;
															}
														}).map((country) => (
															<li key={country.code}>
																{country.name}
																<Flag country={country} />

																<ReactSVG
																	className="removeGeoButton"
																	src={CloseIcon}
																	data-country={country.code}
																	title={`remove ${country.name}`}
																	onClick={this.removeCountry}
																/>

																{country.regions && country.regions.length ?
																	<ul className={"selectedRegions" + country.code}>
																	{country.regions.sort((a, b) => {
																		if (a.name < b.name) {
																			return -1;
																		} else if (a.name > b.name) {
																			return 1;
																		} else {
																			return 0;
																		}
																	}).map((region) => (
																		<li key={region.id}>
																			{region.name}

																			<ReactSVG
																				className="removeGeoButton"
																				src={CloseIcon}
																				data-country={region.country}
																				data-region={region.id}
																				title={`remove ${region.name}`}
																				onClick={this.removeRegion}
																			/>

																		</li>
																	))}
																	</ul>
																: ""
																}

															</li>
														))}
													</React.Fragment>
												}
											</ul>

										</div>

									</div>

								: this.state.locationTab === "distance" ?

									<div className="formSection">

										<div className="inputGroup half">
											<label htmlFor="searchDistance">Within</label>
											<input
												id="searchDistance"
												name="searchDistance"
												type="number"
												min="1"
												max="10000"
												required={true}
												value={this.state.searchDistance}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup half distanceUnits">
											( <span
												className={this.state.distanceUnits === "mi" ? "activeTab" : ""}
												data-unit="mi"
												onClick={this.changeUnits}
											>
												mi
											</span> | <span
												className={this.state.distanceUnits === "km" ? "activeTab" : ""}
												data-unit="km"
												onClick={this.changeUnits}
											>
												km
											</span> ) of address:
										</div>

										<div className="inputGroup">
											<label htmlFor="address1">Street Address</label>
											<input
												id="address1"
												name="address1"
												type="text"
												required={true}
												value={this.state.address1}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="addressCity">City</label>
											<input
												id="addressCity"
												name="addressCity"
												type="addressCity"
												required={true}
												value={this.state.addressCity}
												onChange={this.handleInputChange}
											/>
										</div>

										<div className="inputGroup">
											<label htmlFor="addressCountry">Country</label>
											<Select
												id="addressCountry"
												name="addressCountry"
												className="Select searchSelectCountries"
												classNamePrefix="Select"
												value={this.state.addressCountry}
												onChange={this.handleAddressCountryChange}
												options={this.state.countryList}
												getOptionLabel={this.getCountryOptionLabel}
												isSearchable={true}
												isClearable={true}
											/>
										</div>

										{(this.state.addressCountry
											&& this.state.addressCountry.code
											&& this.state.addressCountry.regions
											&& this.state.addressCountry.regions.length) ?

											<div className="inputGroup">
												<label htmlFor="addressRegion">{this.state.addressCountry.regionType}</label>
												<Select
													id="addressRegion"
													name="addressRegion"
													className="Select searchSelectRegions"
													classNamePrefix="Select"
													value={this.state.addressRegion}
													onChange={this.handleAddressRegionChange}
													options={this.state.addressCountry.regions}
													getOptionLabel={this.getRegionOptionLabel}
													isSearchable={true}
													isClearable={true}
												/>
											</div>

										: ""}

										<div className="inputGroup">
											<label htmlFor="addressPostal">Postal Code <em>(optional)</em></label>
											<input
												id="addressPostal"
												name="addressPostal"
												type="text"
												required={false}
												value={this.state.addressPostal}
												onChange={this.handleInputChange}
											/>
										</div>

									</div>

								: ""}

							</div>

							{this.state.eventFeatures.tracks.length
								&& this.state.eventFeatures.derbytypes.length
								&& this.state.eventFeatures.sanctions.length ?

								<FeatureIconSet
									data={[
										{
											items: this.state.eventFeatures.tracks,
											label: "Filter Tracks:",
											type: "track",
										},
										{
											items: this.state.eventFeatures.derbytypes,
											label: "Filter Derby Types:",
											type: "derbytype",
										},
										{
											items: this.state.eventFeatures.sanctions,
											label: "Filter Sanctions:",
											type: "sanction",
										},
									]}
									selected={this.state.selectedFeatures}
									toggle={this.toggleFeatureIcon}
								/>


							: ""}

						</div>

						<div className="searchButtons">
							<button
								className="largeButton"
								onClick={this.submitSearch}
								disabled={
									this.state.locationTab === "distance"
									&& (!this.state.address1
										|| !this.state.addressCity
										|| !this.state.addressCountry.code
										|| (this.state.addressCountry.regionType
											&& !this.state.addressRegion.id)
										)
								}
							>
								Search
							</button>
						</div>

					</React.Fragment>
				}

			</React.Fragment>
		);

	}

	addCountry(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		const country = Object.assign({}, this.state.countrySelectValue);
		const countryList: IGeoCountry[] = ([]).concat(this.state.countryList);
		const selectedLocations = ([]).concat(this.state.selectedLocations);

		selectedLocations.push(Object.assign(country, {
			regions: null,
		}));

		countryList.filter((c) => c.code === country.code)[0].disabled = true;

		this.setState({
			countryList,
			countrySelectValue: {} as IGeoCountry,
			regionSelectValue: {} as IGeoRegion,
			selectedLocations,
		});

	}

	addRegion(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		const countryList: IGeoCountry[] = ([]).concat(this.state.countryList);
		const region: IGeoRegion = Object.assign({}, this.state.regionSelectValue);
		const selectedLocations: IGeoCountry[] = ([]).concat(this.state.selectedLocations);

		const country: IGeoCountry = Object.assign({}, selectedLocations.filter((c) => c.code === region.country)[0]);

		if (country.regions) {

			country.regions.push(region);

		} else if (!country.code) {

			const addCountry: IGeoCountry = Object.assign({}, countryList.filter((c) => c.code === region.country)[0]);

			selectedLocations.push(Object.assign(addCountry, {
				regions: [region],
			}));

		}

		countryList.filter((c) => c.code === region.country)[0]
			.regions.filter((r) => r.id === region.id)[0].disabled = true;

		this.setState({
			countryList,
			regionSelectValue: {} as IGeoRegion,
			selectedLocations,
		});

	}

	clearDates() {

		this.setState({
			dateRangeDisplay: formatDateRange({
				start: moment(),
			}),
			endDate: null,
			focusedInput: "startDate",
			startDate: null,
		});

	}

	determineStartMonth() {

		if (this.state.startDate) {
			return this.state.startDate;
		} else {
			return moment();
		}

	}

	changeCountrySelect(country: IGeoCountry) {

		this.setState({
			countrySelectValue: country || {} as IGeoCountry,
			regionSelectValue: {} as IGeoRegion,
		});

	}

	changeLocationTab(event: React.MouseEvent<HTMLSpanElement>) {

		event.preventDefault();

		this.setState({
			locationTab: event.currentTarget.dataset.tab,
		});

	}

	changeUnits(event: React.MouseEvent<HTMLSpanElement>) {

		event.preventDefault();

		this.setState({
			distanceUnits: event.currentTarget.dataset.unit,
		});

	}

	changeRegionSelect(region: IGeoRegion) {

		this.setState({
			regionSelectValue: region || {} as IGeoRegion,
		});

	}

	getCountryOptionLabel(option: IGeoCountry) {

		return option.name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion) {

		return option.name || "(type here to search list)";

	}

	handleAddressCountryChange(country: IGeoCountry) {

		this.setState({
			addressCountry: country || {} as IGeoCountry,
			addressRegion: {} as IGeoRegion,
		});

	}

	handleAddressRegionChange(region: IGeoRegion) {

		this.setState({
			addressRegion: region || {} as IGeoRegion,
		});

	}

	handleFocusChange(focusedInput: FocusedInputShape) {

		this.setState({ focusedInput });

	}

	handleInputChange <T extends keyof ISearchState>(event: React.ChangeEvent<HTMLInputElement>) {

		const fieldName: (keyof ISearchState) = event.currentTarget.name as (keyof ISearchState);
		let value = event.currentTarget.value;

		if (event.currentTarget.type === "number") {

			if (event.currentTarget.value && event.currentTarget.min && Number(event.currentTarget.value) < Number(event.currentTarget.min)) {

				value = event.currentTarget.min;

			} else if (event.currentTarget.max && Number(event.currentTarget.value) > Number(event.currentTarget.max)) {

				value = event.currentTarget.max;

			}

		}

		const newState = {
			[fieldName]: value,
		};

		this.setState(newState as { [P in T]: ISearchState[P]; });

	}

	isBeforeToday(date: moment.Moment) {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const day = date.hours(0).minute(0).seconds(0);

		return day < todaysDate;
	}

	isCountryOptionDisabled(option: IGeoCountry) {

		return option.disabled;

	}

	isRegionOptionDisabled(option: IGeoRegion) {

		return option.disabled;
	}

	onDatesChange(dates: {startDate: moment.Moment, endDate: moment.Moment}) {

		this.setState({
			dateRangeDisplay: formatDateRange({
				end: dates.endDate ? dates.endDate : null,
				start: dates.startDate ? dates.startDate : moment(),
			}),
			endDate: dates.endDate,
			startDate: dates.startDate,
		});

	}

	removeCountry(event: React.MouseEvent<HTMLDivElement>) {

		event.preventDefault();

		const countryCode = event.currentTarget.dataset.country;
		const countryList: IGeoCountry[] = ([]).concat(this.state.countryList);
		let selectedLocations: IGeoCountry[] = ([]).concat(this.state.selectedLocations);

		const country: IGeoCountry = Object.assign({}, selectedLocations.filter((c) => c.code === countryCode)[0]);

		selectedLocations = selectedLocations.filter((c) => c.code !== countryCode);
		countryList.filter((c) => c.code === country.code)[0].disabled = false;

		if (country.regions && country.regions.length) {

			countryList.filter((c) => c.code === country.code)[0]
				.regions =
				countryList.filter((c) => c.code === country.code)[0]
					.regions.map((r) => ({
						...r,
						disabled: false,
					}));

		}

		this.setState({
			countryList,
			selectedLocations,
		});

	}

	removeRegion(event: React.MouseEvent<HTMLDivElement>) {

		event.preventDefault();

		const countryCode = event.currentTarget.dataset.country;
		const countryList: IGeoCountry[] = ([]).concat(this.state.countryList);
		const regionSelectValue: IGeoRegion = Object.assign({}, this.state.regionSelectValue);
		const regionId = event.currentTarget.dataset.region;
		let selectedLocations: IGeoCountry[] = ([]).concat(this.state.selectedLocations);

		const country: IGeoCountry = Object.assign({}, selectedLocations.filter((c) => c.code === countryCode)[0]);

		if (country.regions.length === 1) {

			selectedLocations = selectedLocations.filter((c) => c.code !== countryCode);

		} else {

			selectedLocations.filter((c) => c.code === countryCode)[0].regions =
				selectedLocations.filter((c) => c.code === countryCode)[0]
					.regions.filter((r) => r.id !== Number(regionId));
		}

		countryList.filter((c) => c.code === countryCode)[0]
			.regions.filter((r) => r.id === Number(regionId))[0].disabled = false;

		this.setState({
			countryList,
			regionSelectValue, // trick to make region options refresh
			selectedLocations,
		});

	}

	renderMonthHeader(date: {month: moment.Moment}) {

		return (
			<React.Fragment>
				<span className="monthLong">{date.month.format("MMMM")}</span><span className="monthShort">{date.month.format("MMM")}</span> {date.month.format("Y")}
			</React.Fragment>
		);

	}

	toggleFeatureIcon(event: React.MouseEvent<HTMLDivElement>) {

		console.log(event.currentTarget.dataset.feature);

		event.preventDefault();

		const selectedFeatures = this.state.selectedFeatures;
		const feature = event.currentTarget.dataset.feature;
		const iconIndex = selectedFeatures.indexOf(feature);

		if (iconIndex === -1) {
			selectedFeatures.push(feature);
		} else {
			selectedFeatures.splice(iconIndex, 1);
		}

		this.setState({
			selectedFeatures,
		});

	}

	submitSearch() {

		let searchURL = "";
		const queryParts = [];
		const eventFeatures: {
			derbytypes: string[],
			sanctions: string[],
			tracks: string[],
		} = {
			derbytypes: [],
			sanctions: [],
			tracks: [],
		};

		if (this.state.startDate) {
			searchURL += `/${this.state.startDate.format("Y-MM-DD")}`;
		}
		if (this.state.endDate) {
			searchURL += `/${this.state.endDate.format("Y-MM-DD")}`;
		}

		if (this.state.locationTab === "locations" && this.state.selectedLocations.length) {

			queryParts.push(`locations(${
				this.state.selectedLocations.map((country: IGeoCountry) =>
				country.code
				+ (country.regions && country.regions.length ?
					"-" + country.regions
							.map((reg: IGeoRegion) => (reg.id)).join("+")
					: "")).join(",")
				})`);

		} else if (this.state.locationTab === "distance") {

			queryParts.push(`distance(${this.state.address1
				}~${this.state.addressCity
				}~${this.state.addressRegion.abbreviation || ""
				}~${this.state.addressPostal || ""
				}~${this.state.addressCountry.code
				}~${this.state.searchDistance
				}~${this.state.distanceUnits})`);

		}

		for (let feature = 0; feature < this.state.selectedFeatures.length; feature ++) {

			const [label, value] = this.state.selectedFeatures[feature].split("-");
			const featureName: (keyof IDerbyFeatures) = `${label}s` as (keyof IDerbyFeatures);
			eventFeatures[featureName].push(value);

		}

		for (const feature in eventFeatures) {
			if (eventFeatures.hasOwnProperty(feature)) {

				const featureName: (keyof IDerbyFeatures) = feature as (keyof IDerbyFeatures);
				if (eventFeatures[featureName].length) {
					queryParts.push(`${feature}(${eventFeatures[featureName].join(",")})`);
				}

			}
		}

		this.props.history.push(searchURL +
			(queryParts.length ? `/${queryParts.join("/")}` : ""));

	}

	loadData() {

		let countryList: IGeoCountry[] = [];
		let eventSanctions: IDerbyFeature[] = [];
		let eventTracks: IDerbyFeature[] = [];
		let eventTypes: IDerbyFeature[] = [];
		let promiseError = false;
		const promises: Array<Promise<any>> = [];

		promises.push(getGeography()
			.then((countries: IGeoCountry[]) => {

				countryList = countries;

			})
			.catch((error) => {

				console.error(error);
				promiseError = true;

			}));

		promises.push(getDerbySanctions()
			.then((sanctions: IDerbyFeature[]) => {

				eventSanctions = sanctions;

			})
			.catch((error) => {

				console.error(error);
				promiseError = true;

			}));

		promises.push(getDerbyTracks()
			.then((tracks: IDerbyFeature[]) => {

				eventTracks = tracks;

			})
			.catch((error) => {

				console.error(error);
				promiseError = true;

			}));

		promises.push(getDerbyTypes()
			.then((derbytypes: IDerbyFeature[]) => {

				eventTypes = derbytypes;

			})
			.catch((error) => {

				console.error(error);
				promiseError = true;

			}));

		const getData = this.addPromise(
			Promise.all(promises));

		getData
			.then(() => {

			if (!promiseError) {

				this.setState({
					countryList,
					eventFeatures: {
						derbytypes: eventTypes,
						sanctions: eventSanctions,
						tracks: eventTracks,
					},
				});

				const startState = {
					loading: false,
					locationTab: "none",
					selectedFeatures: [],
				} as IStartState;

				if (this.props.lastSearch) {

					if (this.props.lastSearch.startDate) {

						Object.assign(startState, {
							dateRangeDisplay: formatDateRange({
								end: this.props.lastSearch.endDate ? moment(this.props.lastSearch.endDate, "Y-MM-DD") : null,
								start: this.props.lastSearch.startDate ? moment(this.props.lastSearch.startDate, "Y-MM-DD") : null,
							}),
							endDate: this.props.lastSearch.endDate ? moment(this.props.lastSearch.endDate, "Y-MM-DD") : null,
							startDate: this.props.lastSearch.startDate ? moment(this.props.lastSearch.startDate, "Y-MM-DD") : null,
						});

					}

					if (this.props.lastSearch.derbytypes && this.props.lastSearch.derbytypes.length) {

						startState.selectedFeatures = startState.selectedFeatures.concat(
							this.props.lastSearch.derbytypes.map((derbytype) => `derbytype-${derbytype.id}`));

					}

					if (this.props.lastSearch.sanctions && this.props.lastSearch.sanctions.length) {

						startState.selectedFeatures = startState.selectedFeatures.concat(
							this.props.lastSearch.sanctions.map((sanction) => `sanction-${sanction.id}`));

					}

					if (this.props.lastSearch.tracks && this.props.lastSearch.tracks.length) {

						startState.selectedFeatures = startState.selectedFeatures.concat(
							this.props.lastSearch.tracks.map((track) => `track-${track.id}`));

					}

					if (this.props.lastSearch.address && this.props.lastSearch.distanceUnits) {

						const [address1, city, regionAbbr, postal, countryCode, distanceString, distanceUnits]
							= this.props.lastSearch.address.split("~");

						const country = countryList.filter((c) => c.code === countryCode)[0];

						Object.assign(startState, {
							address1,
							addressCity: city,
							addressCountry: country,
							addressPostal: postal,
							addressRegion: regionAbbr && country.regions ?
								country.regions.filter((r) => r.abbreviation === regionAbbr)[0] || {} as IGeoRegion
								: {} as IGeoRegion,
							distanceUnits,
							locationTab: "distance",
							searchDistance: Number(distanceString),
						});


					} else if (this.props.lastSearch.locations && this.props.lastSearch.locations.length) {

						Object.assign(startState, {
							locationTab: "locations",
							selectedLocations: this.props.lastSearch.locations,
						});

					}

					this.setState(startState as ISearchState);

				}

			}

		})
		.catch((error) => {

			console.error(error);

		})
		.finally(getData.clear);

	}

}
