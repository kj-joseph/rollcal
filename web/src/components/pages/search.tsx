import React from "react";

import { IDerbyDates } from "interfaces/event";
import { IDerbyFeatures, IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList } from "interfaces/geo";
import { IProps } from "interfaces/redux";

import { DayPickerRangeController, FocusedInputShape } from "react-dates";
import "react-dates/initialize";

import moment from "moment";

import Select from "react-select";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography } from "components/lib/data";
import FeatureIcon from "components/partials/featureIcon";
import RemoveCountryButton from "components/partials/removeCountryButton";
import RemoveRegionButton from "components/partials/removeRegionButton";

import { formatDateRange } from "components/lib/dateTime";

interface ISearchState {
	countryList: IGeoCountry[];
	countrySelectValue: IGeoCountry;
	dateRangeDisplay: string;
	endDate: moment.Moment;
	eventFeatures: IDerbyFeatures;
	focusedInput: FocusedInputShape;
	loading: boolean;
	path: string;
	regionLists: IGeoRegionList;
	regionSelectValue: IGeoRegion;
	selectedCountries: IGeoCountry[];
	selectedEventFeatures: string[];
	selectedRegions: IGeoRegionList;
	startDate: moment.Moment;
}

export default class Search extends React.Component<IProps, ISearchState> {

	constructor(props: IProps) {
		super(props);

		this.state = {
			countryList: [],
			countrySelectValue: {} as IGeoCountry,
			dateRangeDisplay: formatDateRange({
				firstDay: moment(),
			}),
			endDate: null,
			eventFeatures: {} as IDerbyFeatures,
			focusedInput: "startDate",
			loading: true,
			path: null,
			regionLists: {},
			regionSelectValue: {} as IGeoRegion,
			selectedCountries: [],
			selectedEventFeatures: [],
			selectedRegions: {} as IGeoRegionList,
			startDate: null,
		};

		this.addLocation = this.addLocation.bind(this);
		this.addLocationCountry = this.addLocationCountry.bind(this);
		this.addLocationRegion = this.addLocationRegion.bind(this);
		this.changeCountrySelect = this.changeCountrySelect.bind(this);
		this.changeRegionSelect = this.changeRegionSelect.bind(this);
		this.clearDates = this.clearDates.bind(this);
		this.determineStartMonth = this.determineStartMonth.bind(this);
		this.getCountryOptionLabel = this.getCountryOptionLabel.bind(this);
		this.getRegionOptionLabel = this.getRegionOptionLabel.bind(this);
		this.handleFocusChange = this.handleFocusChange.bind(this);
		this.isBeforeToday = this.isBeforeToday.bind(this);
		this.isCountryOptionDisabled = this.isCountryOptionDisabled.bind(this);
		this.isRegionOptionDisabled = this.isRegionOptionDisabled.bind(this);
		this.loadData = this.loadData.bind(this);
		this.onDatesChange = this.onDatesChange.bind(this);
		this.removeLocation = this.removeLocation.bind(this);
		this.renderMonthHeader = this.renderMonthHeader.bind(this);
		this.submitSearch = this.submitSearch.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

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

								<div className="searchLocations">
									<p><strong>Filter by Location</strong></p>

									<Select
										className="Select searchSelectCountries"
										classNamePrefix="Select"
										name="search-countries"
										value={this.state.countrySelectValue}
										onChange={this.changeCountrySelect}
										options={this.state.countryList}
										isOptionDisabled={this.isCountryOptionDisabled}
										getOptionLabel={this.getCountryOptionLabel}
										isSearchable={true}
										isClearable={true}
									/>

									{true || this.state.countrySelectValue ?
										<div className="locationButton">
											<button
												className="smallButton"
												disabled={!this.state.countrySelectValue
													|| !this.state.countrySelectValue.country_name
													|| !!this.state.selectedRegions[this.state.countrySelectValue.country_code]}
												onClick={this.addLocationCountry}
											>
												Add {this.state.countrySelectValue ? this.state.countrySelectValue.country_name : ""} to Location List
											</button>
										</div>
									: ""
									}

									{(this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code]) ?

										<React.Fragment>
											<p className="selectChoiceText">or select a {this.state.countrySelectValue.country_region_type}:</p>
											<Select
												className="Select searchSelectRegions"
												classNamePrefix="Select"
												name="search-countries"
												value={this.state.regionSelectValue}
												isDisabled={!(this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code])}
												onChange={this.changeRegionSelect}
												options={this.state.countrySelectValue
													&& this.state.countrySelectValue.country_code
													&& this.state.regionLists[this.state.countrySelectValue.country_code]
													? this.state.regionLists[this.state.countrySelectValue.country_code]
													: []}
												isOptionDisabled={this.isRegionOptionDisabled}
												getOptionLabel={this.getRegionOptionLabel}
												isSearchable={true}
												isClearable={true}
											/>
										{true || this.state.regionSelectValue ?
											<div className="locationButton">
												<button
													className="smallButton"
													disabled={!this.state.regionSelectValue ||
														!this.state.regionSelectValue.region_id}
													onClick={this.addLocationRegion}
												>
													Add {this.state.regionSelectValue ? this.state.regionSelectValue.region_name : ""} to Location List
												</button>
											</div>
										: ""
										}
										</React.Fragment>

									: ""
									}

									<p className="selectedLocationsHeader"><strong>Selected Locations</strong></p>

									<ul className="selectedLocations">
										{!this.state.selectedCountries.length ?
											<li>All</li>
										:
											<React.Fragment>
												{this.state.selectedCountries.sort((a: IGeoCountry, b: IGeoCountry) => {
													if (a.country_name < b.country_name) {
														return -1;
													} else if (a.country_name > b.country_name) {
														return 1;
													} else {
														return 0;
													}
												}).map((country: IGeoCountry) => (
													<li key={country.country_code}>
														{country.country_name} <span title={country.country_name} className={"flag-icon flag-icon-" + country.country_flag} />
														<RemoveCountryButton
															code={country.country_code}
															name={country.country_name}
															onButtonClick={this.removeLocation}
														/>
														{this.state.selectedRegions[country.country_code] ?
															<ul className={"selectedRegions" + country.country_code}>
															{this.state.selectedRegions[country.country_code].sort((a: IGeoRegion, b: IGeoRegion) => {
																if (a.region_name < b.region_name) {
																	return -1;
																} else if (a.region_name > b.region_name) {
																	return 1;
																} else {
																	return 0;
																}
															}).map((region: IGeoRegion) => (
																<li key={region.region_id}>
																	{region.region_name}
																	<RemoveRegionButton
																		country={region.region_country}
																		id={region.region_id}
																		name={region.region_name}
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

							{this.state.eventFeatures.tracks ?
								<div className="derbyFeatures">

									{(this.state.eventFeatures.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											<span className="label">Filter Tracks</span>
											{this.state.eventFeatures.tracks.map((icon: IDerbyTrack) => (
												<FeatureIcon
													imageClass={this.state.selectedEventFeatures.indexOf("track-" + icon.track_id) > -1 ? "selected" : ""}
													abbreviation={icon.track_abbreviation}
													id={icon.track_id}
													key={icon.track_id}
													title={icon.title}
													featureType="track"
													toggleFunction={this.toggleFeatureIcon}
												/>
											))}
										</span>
										: "" )}

									{(this.state.eventFeatures.derbytypes.length ?
										<span className="eventIconGroup eventIconDerbytypes">
											<span className="label">Filter Derby Types</span>
											{this.state.eventFeatures.derbytypes.map((icon: IDerbyType) => (
												<FeatureIcon
													imageClass={this.state.selectedEventFeatures.indexOf("derbytype-" + icon.derbytype_id) > -1 ? "selected" : ""}
													abbreviation={icon.derbytype_abbreviation}
													id={icon.derbytype_id}
													key={icon.derbytype_id}
													title={icon.title}
													featureType="derbytype"
													toggleFunction={this.toggleFeatureIcon}
												/>
											))}
										</span>
										: "" )}

									{(this.state.eventFeatures.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											<span className="label">Filter Sanctions</span>
											{this.state.eventFeatures.sanctions.map((icon: IDerbySanction) => (
												<FeatureIcon
													imageClass={this.state.selectedEventFeatures.indexOf("sanction-" + icon.sanction_id) > -1 ? "selected" : ""}
													abbreviation={icon.sanction_abbreviation}
													id={icon.sanction_id}
													key={icon.sanction_id}
													title={icon.title}
													featureType="sanction"
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
							<button className="largeButton" onClick={this.submitSearch}>Search</button>
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

		this.setState({
			dateRangeDisplay: formatDateRange({
				firstDay: moment(),
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

		const dateObject: IDerbyDates = {
			firstDay: dates.startDate ? dates.startDate : moment(),
			lastDay: dates.endDate ? dates.endDate : null,
		};
		this.setState({
			dateRangeDisplay: formatDateRange(dateObject),
			endDate: dates.endDate,
			startDate: dates.startDate,
		});

	}

	changeCountrySelect(country: IGeoCountry) {

		this.setState({
			countrySelectValue: Object.assign({disabled: true}, country) || {} as IGeoCountry,
			regionSelectValue: {} as IGeoRegion,
		});

	}

	changeRegionSelect(region: IGeoRegion) {

		this.setState({
			regionSelectValue: region || {} as IGeoRegion,
		});

	}

	addLocation(country: IGeoCountry, region?: IGeoRegion) {

		let countries = this.state.selectedCountries;
		const countryList = this.state.countryList;
		const newState = {} as any;
		const regionLists = this.state.regionLists;
		const regions: IGeoRegionList = this.state.selectedRegions;

		const addCountry = (c: IGeoCountry) => {
			countries = countries.concat([c]);
			if (!regions[c.country_code]) {
				countryList[countryList.findIndex((x: IGeoCountry) => x.country_code === c.country_code)].disabled = true;
			}
		};

		const addRegion = (c: IGeoCountry, r: IGeoRegion) => {
			if (!regions[r.region_country]) {
				regions[r.region_country] = [];
				addCountry(c);
			}
			regions[r.region_country].push(r);
			regionLists[r.region_country][regionLists[r.region_country].findIndex((x: IGeoRegion) => x.region_id === r.region_id)].disabled = true;
		};

		if (region) {
			addRegion(country, region);
		} else {
			addCountry(country);
		}

		newState.selectedRegions = regions;
		newState.selectedCountries = countries;
		newState.countryList = countryList;
		newState.regionLists = regionLists;

		if (region) {
			newState.regionSelectValue = {} as IGeoRegion;
		} else {
			newState.countrySelectValue = {} as IGeoCountry;
		}

		this.setState(newState);

	}

	addLocationCountry() {

		this.addLocation(this.state.countrySelectValue);

	}

	addLocationRegion() {

		this.addLocation(this.state.countrySelectValue, this.state.regionSelectValue);

	}

	removeLocation(countryCode: string, regionId?: number) {

		const countryList = this.state.countryList;
		const regionLists = this.state.regionLists;
		const regions = this.state.selectedRegions;
		let countries = this.state.selectedCountries;

		const removeCountry = (country: string) => {
			countries = countries.filter((c: IGeoCountry) => c.country_code !== country);
			if (regions[country]) {
				delete regions[country];
			}
			countryList[countryList.findIndex((x: IGeoCountry) => x.country_code === country)].disabled = false;
		};

		const removeRegion = (c: string, r: number) => {
			if (regions[c]) {
				regionLists[c][regionLists[c].findIndex((x: IGeoRegion) => x.region_id === r)].disabled = false;
				regions[c] = regions[c].filter((region: IGeoRegion) => region.region_id !== r);
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

		this.setState({
			countryList,
			regionLists,
			selectedCountries: countries,
			selectedRegions: regions,
		});

		this.forceUpdate();

	}

	toggleFeatureIcon(icon: string) {

		const selectedEventFeatures = this.state.selectedEventFeatures;
		const iconIndex = selectedEventFeatures.indexOf(icon);

		if (iconIndex === -1) {
			selectedEventFeatures.push(icon);
		} else {
			selectedEventFeatures.splice(iconIndex, 1);
		}

		this.setState({
			selectedEventFeatures,
		});

	}

	handleFocusChange(focusedInput: FocusedInputShape) {

		this.setState({ focusedInput });

	}

	isCountryOptionDisabled(option: IGeoCountry) {

		return option.disabled;

	}

	isRegionOptionDisabled(option: IGeoRegion) {

		return option.disabled;

	}

	getCountryOptionLabel(option: IGeoCountry) {

		return option.country_name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion) {

		return option.region_name || "(type here to search list)";

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

		if (this.state.selectedCountries.length) {

			queryParts.push("locations(" + this.state.selectedCountries.map((c: IGeoCountry) =>
				c.country_code
				+ (this.state.selectedRegions[c.country_code] ?
					"-" + this.state.selectedRegions[c.country_code]
							.map((reg: IGeoRegion) => (reg.region_id)).join("+")
					: "")).join(",") + ")");

		}

		for (let feature = 0; feature < this.state.selectedEventFeatures.length; feature ++) {

			const [label, value] = this.state.selectedEventFeatures[feature].split("-");
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
		let eventSanctions: IDerbySanction[] = [];
		let eventTracks: IDerbyTrack[] = [];
		let eventTypes: IDerbyType[] = [];
		const promises: Array<Promise<any>> = [];
		let regionLists: IGeoRegionList = {};

		promises.push(getGeography(
			this.props.apiLocation,
			this.props.dataGeography,
			this.props.saveDataGeography)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbySanctions(
			this.props.apiLocation,
			this.props.dataSanctions,
			this.props.saveDataSanctions)
			.then((dataResponse: IDerbySanction[]) => {
				eventSanctions = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTracks(
			this.props.apiLocation,
			this.props.dataTracks,
			this.props.saveDataTracks)
			.then((dataResponse: IDerbyTrack[]) => {
				eventTracks = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTypes(
			this.props.apiLocation,
			this.props.dataDerbyTypes,
			this.props.saveDataDerbyTypes)
			.then((dataResponse: IDerbyType[]) => {
				eventTypes = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		Promise.all(promises).then(() => {

			this.setState({
				countryList,
				eventFeatures: {
					derbytypes: eventTypes,
					sanctions: eventSanctions,
					tracks: eventTracks,
				},
				regionLists,
			});

			let startState: {
				dateRangeDisplay: string,
				endDate: moment.Moment,
				loading: false,
				startDate: moment.Moment,
				selectedEventFeatures: string[],
			};

			startState = {
				loading: false,
			} as typeof startState;

			if (this.props.lastSearch) {

				const searchParts = this.props.lastSearch.match(/\/((?:\/?[0-9]{4}-[0-9]{2}-[0-9]{2}){0,2})\/?(.*)$/);

				if (searchParts[1]) {
					const [startDate, endDate] = searchParts[1].split("/");

					startState.dateRangeDisplay = formatDateRange({
						firstDay: moment(startDate) || null,
						lastDay: moment(endDate) || null,
					});

					if (startDate) {
						startState.startDate = moment(startDate);
					}

					if (endDate) {
						startState.endDate = moment(endDate);
					}

				}

				if (searchParts[2]) {
					const features = [];

					for (const searchPart of searchParts[2].split("/")) {
						const [, label, value] = searchPart.match(/([a-z]+)\((.*)\)/);

						switch (label) {
							case "locations":

								for (const countryItem of value.split(",")) {
									const [country, regions] = countryItem.split("-");

									if (regions) {

										for (const region of regions.split("+")) {

											this.addLocation(
												countryList.filter((c: IGeoCountry) => c.country_code === country)[0],
												regionLists[country].filter((r: IGeoRegion) => r.region_id === Number(region))[0]);

										}

										// test

									} else {

										this.addLocation(
											countryList.filter((c: IGeoCountry) => c.country_code === country)[0]);

									}

								}

								break;

							case "tracks":
							case "derbytypes":
							case "sanctions":

								for (const item of value.split(",")) {
									features.push(`${label.slice(0, -1)}-${item.trim()}`);
								}
								break;
						}
					}

					startState.selectedEventFeatures = features;
				}
			}

			this.setState(startState);

		});

	}

}
