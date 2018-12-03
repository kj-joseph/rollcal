import React from "react";

import { IDerbyDates } from "interfaces/event";
import { IDerbyFeature, IDerbyFeatures } from "interfaces/feature";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";

import { DayPickerRangeController, FocusedInputShape } from "react-dates";
import "react-dates/initialize";

import moment from "moment";

import Select from "react-select";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes } from "services/feature";
import { getGeography } from "services/geo";

import FeatureIcon from "components/featureIcon";
import RemoveCountryButton from "components/removeCountryButton";
import RemoveRegionButton from "components/removeRegionButton";

import { formatDateRange } from "services/time";

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

export default class Search extends React.Component<IProps> {

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
		this.removeLocation = this.removeLocation.bind(this);
		this.renderMonthHeader = this.renderMonthHeader.bind(this);
		this.setSafeState = this.setSafeState.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
	}

	setSafeState <T extends keyof ISearchState>(stateObject: {
		[key in T]: any
	}) {
		if (this.state) {
			this.setState(stateObject);
		}
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

			this.setSafeState({
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
										: ""
										}
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
										: ""
										}

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
													options={this.state.countrySelectValue
														&& this.state.countrySelectValue.regions
														&& this.state.countrySelectValue.regions.length
														? this.state.countrySelectValue.regions
														: []}
													isOptionDisabled={this.isRegionOptionDisabled}
													getOptionLabel={this.getRegionOptionLabel}
													isSearchable={true}
													isClearable={true}
												/>
												</div>
											{true || this.state.regionSelectValue ?
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
											: ""
											}
											</React.Fragment>

										: ""
										}

										<div className="selectedLocationsContainer">

											<p className="selectedLocationsHeader">Selected Locations</p>

											<ul className="selectedLocations">
												{!this.state.selectedLocations.length ?
													<li>All</li>
												:
													<React.Fragment>
														{this.state.selectedLocations.sort((a: IGeoCountry, b: IGeoCountry) => {
															if (a.name < b.name) {
																return -1;
															} else if (a.name > b.name) {
																return 1;
															} else {
																return 0;
															}
														}).map((country: IGeoCountry) => (
															<li key={country.code}>
																{country.name} <span title={country.name} className={"flag-icon flag-icon-" + country.flag} />
																<RemoveCountryButton
																	code={country.code}
																	name={country.name}
																	onButtonClick={this.removeLocation}
																/>
																{this.state.selectedRegions[country.code] ?
																	<ul className={"selectedRegions" + country.code}>
																	{this.state.selectedRegions[country.code].sort((a: IGeoRegion, b: IGeoRegion) => {
																		if (a.name < b.name) {
																			return -1;
																		} else if (a.name > b.name) {
																			return 1;
																		} else {
																			return 0;
																		}
																	}).map((region: IGeoRegion) => (
																		<li key={region.id}>
																			{region.name}
																			<RemoveRegionButton
																				country={region.country}
																				id={region.id}
																				name={region.name}
																				onButtonClick={this.removeLocation}
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
											&& this.state.regionLists[this.state.addressCountry.code]) ?

											<div className="inputGroup">
												<label htmlFor="addressRegion">{this.state.addressCountry.type}</label>
												<Select
													id="addressRegion"
													name="addressRegion"
													className="Select searchSelectRegions"
													classNamePrefix="Select"
													value={this.state.addressRegion}
													onChange={this.handleAddressRegionChange}
													options={this.state.addressCountry
														&& this.state.addressCountry.code
														&& this.state.regionLists[this.state.addressCountry.code]
														? this.state.regionLists[this.state.addressCountry.code]
														: []}
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
								<div className="derbyFeatures">

									{(this.state.eventFeatures.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											<span className="label">Filter Tracks:</span>
											{this.state.eventFeatures.tracks.map((track: IDerbyFeature) => (
												<FeatureIcon
													key={track.id}
													feature={track}
													type="track"
													selected={this.state.selectedFeatures.indexOf("track-" + track.id) > -1}
													toggleFunction={this.toggleFeatureIcon}
												/>
											))}
										</span>
										: "" )}

									{(this.state.eventFeatures.derbytypes.length ?
										<span className="eventIconGroup eventIconDerbytypes">
											<span className="label">Filter Derby Types:</span>
											{this.state.eventFeatures.derbytypes.map((derbytype: IDerbyFeature) => (
												<FeatureIcon
													key={derbytype.id}
													feature={derbytype}
													type="derbytype"
													selected={this.state.selectedFeatures.indexOf("derbytype-" + derbytype.id) > -1}
													toggleFunction={this.toggleFeatureIcon}
												/>
											))}
										</span>
										: "" )}

									{(this.state.eventFeatures.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											<span className="label">Filter Sanctions:</span>
											{this.state.eventFeatures.sanctions.map((sanction: IDerbyFeature) => (
												<FeatureIcon
													key={sanction.id}
													feature={sanction}
													selected={this.state.selectedFeatures.indexOf("sanction-" + sanction.id) > -1}
													type="sanction"
													toggleFunction={this.toggleFeatureIcon}
												/>
											))}
										</span>
										: "" )}

								</div>
							: ""
							}
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

	isBeforeToday(date: moment.Moment) {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const day = date.hours(0).minute(0).seconds(0);

		return day < todaysDate;
	}

	clearDates() {

		this.setSafeState({
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

	onDatesChange(dates: {startDate: moment.Moment, endDate: moment.Moment}) {

		this.setSafeState({
			dateRangeDisplay: formatDateRange({
				end: dates.endDate ? dates.endDate : null,
				start: dates.startDate ? dates.startDate : moment(),
			}),
			endDate: dates.endDate,
			startDate: dates.startDate,
		});

	}

	changeCountrySelect(country: IGeoCountry) {

		this.setSafeState({
			countrySelectValue: country || {} as IGeoCountry,
			regionSelectValue: {} as IGeoRegion,
		});

	}

	changeLocationTab(event: React.MouseEvent<HTMLSpanElement>) {

		event.preventDefault();

		this.setSafeState({
			locationTab: event.currentTarget.dataset.tab,
		});

	}

	changeUnits(event: React.MouseEvent<HTMLSpanElement>) {

		event.preventDefault();

		this.setSafeState({
			distanceUnits: event.currentTarget.dataset.unit,
		});

	}

	changeRegionSelect(region: IGeoRegion) {

		this.setSafeState({
			regionSelectValue: region || {} as IGeoRegion,
		});

	}

	addCountry(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		const country = this.state.countrySelectValue;
		let selectedLocations = this.state.selectedLocations;

		selectedLocations = selectedLocations.concat(Object.assign(country, {
			regions: null,
		}));

		this.setSafeState({
			selectedLocations,
		});

	}

	addRegion(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		const region = this.state.regionSelectValue;
		const selectedLocations = this.state.selectedLocations;

		const findCountry = this.state.selectedLocations.filter((country) => country.code === region.country)[0];

		if (findCountry && findCountry.regions) {

			findCountry.regions.push(region);

		} else if (!findCountry) {

			const addCountry = this.state.countryList.filter((country) => country.code === region.country)[0];

			selectedLocations.push(Object.assign(addCountry, {
				regions: [region],
			}));

		}

		this.setSafeState({
			selectedLocations,
		});

	}

	removeLocation(countryCode: string, regionId?: number) {

		const countryList = this.state.countryList;
		const regionLists = this.state.regionLists;
		const regions = this.state.selectedRegions;
		let countries = this.state.selectedLocations;

		const removeCountry = (country: string) => {
			countries = countries.filter((c: IGeoCountry) => c.code !== country);
			if (regions[country]) {
				delete regions[country];
			}
			countryList[countryList.findIndex((x: IGeoCountry) => x.code === country)].disabled = false;
		};

		const removeRegion = (c: string, r: number) => {
			if (regions[c]) {
				regionLists[c][regionLists[c].findIndex((x: IGeoRegion) => x.id === r)].disabled = false;
				regions[c] = regions[c].filter((region: IGeoRegion) => region.id !== r);
				if (!regions[c].length) {
					delete regions[c];
					removeCountry(c);
				}
			}
		};

		if (regionId) {
			removeRegion(countryCode, regionId);
		} else {
			removeCountry(countryCode);
		}

		this.setSafeState({
			countryList,
			selectedLocations: countries,
			selectedRegions: regions,
		});

		this.forceUpdate();

	}

	toggleFeatureIcon(icon: string) {

		const selectedFeatures = this.state.selectedFeatures;
		const iconIndex = selectedFeatures.indexOf(icon);

		if (iconIndex === -1) {
			selectedFeatures.push(icon);
		} else {
			selectedFeatures.splice(iconIndex, 1);
		}

		this.setSafeState({
			selectedFeatures,
		});

	}

	handleAddressCountryChange(country: IGeoCountry) {

		this.setSafeState({
			addressCountry: country || {} as IGeoCountry,
			addressRegion: {} as IGeoRegion,
		});

	}

	handleAddressRegionChange(region: IGeoRegion) {

		this.setSafeState({
			addressRegion: region || {} as IGeoRegion,
		});

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

		this.setSafeState(newState as { [P in T]: ISearchState[P]; });

	}

	handleFocusChange(focusedInput: FocusedInputShape) {

		this.setSafeState({ focusedInput });

	}

	isCountryOptionDisabled(option: IGeoCountry) {

		return !!this.state.selectedLocations
			.filter((country) => country.code === option.code).length;

	}

	isRegionOptionDisabled(option: IGeoRegion) {

		return option.disabled;

	}

	getCountryOptionLabel(option: IGeoCountry) {

		return option.name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion) {

		return option.name || "(type here to search list)";

	}

	renderMonthHeader(date: {month: moment.Moment}) {

		return (
			<React.Fragment>
				<span className="monthLong">{date.month.format("MMMM")}</span><span className="monthShort">{date.month.format("MMM")}</span> {date.month.format("Y")}
			</React.Fragment>
		);

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
				this.state.selectedLocations.map((c: IGeoCountry) =>
				c.code
				+ (this.state.selectedRegions[c.code] ?
					"-" + this.state.selectedRegions[c.code]
							.map((reg: IGeoRegion) => (reg.id)).join("+")
					: "")).join(",")
				})`);

		} else if (this.state.locationTab === "distance") {

			queryParts.push(`distance(${this.state.address1}~${this.state.addressCity}~${this.state.addressCountry.code
				}~${this.state.addressRegion.abbreviation || ""}~${this.state.addressPostal || ""
				}~${this.state.searchDistance}~${this.state.distanceUnits})`);

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
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbySanctions()
			.then((sanctions: IDerbyFeature[]) => {
				eventSanctions = sanctions;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbyTracks()
			.then((tracks: IDerbyFeature[]) => {
				eventTracks = tracks;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbyTypes()
			.then((derbytypes: IDerbyFeature[]) => {
				eventTypes = derbytypes;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		Promise.all(promises).then(() => {

			if (!promiseError) {

				this.setSafeState({
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
							this.props.lastSearch.derbytypes.map((derbytype) => `derbytype-${derbytype.abbreviation}`));

					}

					if (this.props.lastSearch.sanctions && this.props.lastSearch.sanctions.length) {

						startState.selectedFeatures = startState.selectedFeatures.concat(
							this.props.lastSearch.sanctions.map((sanction) => `sanction-${sanction.abbreviation}`));

					}

					if (this.props.lastSearch.tracks && this.props.lastSearch.tracks.length) {

						startState.selectedFeatures = startState.selectedFeatures.concat(
							this.props.lastSearch.tracks.map((track) => `track-${track.abbreviation}`));

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

						startState.selectedLocations = this.props.lastSearch.locations;

					}

					this.setSafeState(startState as ISearchState);

				}

			}

		});
	}

}
