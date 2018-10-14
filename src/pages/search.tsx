import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import { IDerbyDates, IDerbyFeatures, IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IGeoRegion, IGeoRegionList } from "interfaces";

import axios from "axios";

import "react-dates/initialize";
import { DayPickerRangeController } from "react-dates";
import * as moment from "moment";

import Select from "react-select";

import { formatDateRange } from "lib/dateTime";

export default class Search<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			loading: true,
			startDate: null as moment.Moment,
			endDate: null as moment.Moment,
			startDateString: null as string,
			endDateString: null as string,
			dateRangeDisplay: formatDateRange({
				firstDay: moment(),
			}),
			focusedInput: "startDate",
			countryList: [] as IGeoCountry[],
			regionLists: {} as IGeoRegionList,
			countrySelectValue: {} as IGeoCountry,
			selectedCountries: [] as IGeoCountry[],
			regionSelectValue: null as IGeoRegion[],
			selectedRegions: {} as IGeoRegionList,
			eventFeatures: {} as IDerbyFeatures,
			selectedEventFeatures: [] as string[],
		};

		this.isBeforeToday = this.isBeforeToday.bind(this);
		this.onDatesChange = this.onDatesChange.bind(this);
		this.clearDates = this.clearDates.bind(this);
		this.changeCountrySelect = this.changeCountrySelect.bind(this);
		this.changeRegionSelect = this.changeRegionSelect.bind(this);
		this.addLocation = this.addLocation.bind(this);
		this.removeLocation = this.removeLocation.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
		this.submitSearch = this.submitSearch.bind(this);

	}

	componentWillMount() {

		let promises: Promise<any>[] = [];
		let countryList: IGeoCountry[] = [];
		let regionLists: IGeoRegionList = {};
		let eventFeatures: IDerbyFeatures = {} as IDerbyFeatures;
		let eventSanctions: IDerbySanction[] = [];
		let eventTracks: IDerbyTrack[] = [];
		let eventTypes: IDerbyType[] = [];


		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "geography/getAllCountries")
				.then(result => {
					countryList = result.data.response;

					let regionPromises: Promise<void>[] = [];
					for (let c = 0; c < countryList.length; c ++) {
						if (countryList[c].country_region_type) {
							regionPromises.push(new Promise((resolve, reject) => {
								axios.get(this.props.apiLocation + "geography/getRegionsByCountry/" + countryList[c].country_code)
									.then(result => {
										if (result.data.response.length) {
											regionLists[countryList[c].country_code] = result.data.response;
										}
										resolve();
									}
								);
							}));
						}
					}

					if (regionPromises.length) {
						Promise.all(regionPromises).then(() => {
							resolve();
						});
					} else {
						resolve();
					}
				}
			);
		}));

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "eventFeatures/getTracks")
				.then(result => {
					eventTracks = result.data.response;
					resolve();
				}
			);
		}));

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "eventFeatures/getDerbyTypes")
				.then(result => {
					eventTypes = result.data.response;
					resolve();
				}
			);
		}));

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "eventFeatures/getSanctionTypes")
				.then(result => {
					eventSanctions = result.data.response;
					resolve();
				}
			);
		}));

		Promise.all(promises).then(() => {

			this.setState({
				countryList: countryList,
				regionLists: regionLists,
				eventFeatures: {
					derbytypes: eventTypes,
					sanctions: eventSanctions,
					tracks: eventTracks,
				},
				loading: false
			});

			let startState: {
				dateRangeDisplay: string,
				endDate: moment.Moment,
				endDateString: string,
				startDate: moment.Moment,
				startDateString: string,
				selectedEventFeatures: string[],
			};
			startState = {} as typeof startState;

			if (this.props.lastSearch) {
				let parts = this.props.lastSearch.match(/^\/events(?:\/?)([0-9]{4}-[0-9]{2}-[0-9]{2})?(?:\/)?([0-9]{4}-[0-9]{2}-[0-9]{2})?\??(.*)$/i);
				
				if (parts[1]) {
					startState.startDateString = parts[1];
					startState.startDate = moment(parts[1].substr(0,4) + "-" + parts[1].substr(5,2)  + "-" +  parts[1].substr(8,2));
					
					if (parts[2]) {
						startState.endDateString = parts[2];
						startState.endDate = moment(parts[2].substr(0,4) + "-" + parts[2].substr(5,2)  + "-" +  parts[2].substr(8,2));
					}

					startState.dateRangeDisplay = formatDateRange({
						firstDay: moment(parts[1]) || null,
						lastDay: moment(parts[2]) || null,
					});

				}

				if (parts[3]) {
					let qsParts = parts[3].split("&");
					let features = [];

					for (let q = 0; q < qsParts.length; q ++) {
						let param = qsParts[q].split("=");

						switch(param[0]) {
							case "locations":
								let locations = param[1].split(";");

								for (let l = 0; l < locations.length; l ++) {
									let loc = locations[l].split("-");
									let country:IGeoCountry = countryList.filter((c) => c.country_code === loc[0])[0];

									if (loc.length > 1) {
										let regions = loc[1].split(",");

										for (let reg = 0; reg < regions.length; reg ++) {

											if (regionLists[loc[0]]) {
												this.addLocation(country, 
													regionLists[loc[0]].filter((r: IGeoRegion) => r.region_id === Number(regions[reg]))[0]);
											}
										}

									} else {										
										this.addLocation(country);
									}
								}

							break;

							case "tracks":
							case "derbytypes":
							case "sanctions":
								let values = param[1].split(",");
								for (let v = 0; v < values.length; v ++) {
									features.push(`${param[0]}-${values[v]}`);
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

	isBeforeToday(date: moment.Moment) {

		let todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		let day = date.hours(0).minute(0).seconds(0);

		return day < todaysDate; 
	}

	clearDates() {
		this.setState({
			dateRangeDisplay: formatDateRange({
				firstDay: moment(),
			}),
			startDate: null, 
			endDate: null,
			startDateString: null,
			endDateString: null,
			focusedInput: "startDate"
		});
	}

	onDatesChange(dates: {startDate: moment.Moment, endDate: moment.Moment}) {
		const dateObject: IDerbyDates = {
			firstDay: dates.startDate ? dates.startDate : moment(),
			lastDay: dates.endDate? dates.endDate : null
		}
		this.setState({
			dateRangeDisplay: formatDateRange(dateObject),
			startDateString: dates.startDate ? dates.startDate.format("YYYY-MM-DD") : null,
			endDateString: dates.endDate ? dates.endDate.format("YYYY-MM-DD") : null,
			startDate: dates.startDate, 
			endDate: dates.endDate 
		});
	}

	changeCountrySelect(country: IGeoCountry) {
		this.setState({
			countrySelectValue: Object.assign({disabled: true}, country)
		});
	}

	changeRegionSelect(region: IGeoRegion) {
		this.setState({
			regionSelectValue: region
		});
	}

	addLocation(country: IGeoCountry, region?: IGeoRegion) {
		let countries = this.state.selectedCountries;
		let regions: IGeoRegionList = this.state.selectedRegions;
		let countryList = this.state.countryList;
		let regionLists = this.state.regionLists;
		let newState = {} as any;

		const addCountry = (c: IGeoCountry) => {
			countries = countries.concat([c]);
			if(!regions[c.country_code]) {
				countryList[countryList.findIndex((x: IGeoCountry) => x.country_code === c.country_code)].disabled = true;
			}
		}

		const addRegion = (c: IGeoCountry, r: IGeoRegion) => {
			if (!regions[r.region_country]) {
				regions[r.region_country] = [];
				addCountry(c);
			}
			regions[r.region_country].push(r);
			regionLists[r.region_country][regionLists[r.region_country].findIndex((x: IGeoRegion) => x.region_id === r.region_id)].disabled = true;
		}

		if (region) {
			addRegion(country, region);
		} else {
			addCountry(country);
		}

		newState.selectedRegions = regions;
		newState.selectedCountries = countries,
		newState.countryList = countryList,
		newState.regionLists = regionLists

		if (region) {
			newState.regionSelectValue = null;
		} else {
			newState.countrySelectValue = null;
		}

		this.setState(newState);

	}

	removeLocation(country_code: string, region_id?: number) {
		let countries = this.state.selectedCountries;
		let regions = this.state.selectedRegions;
		let countryList = this.state.countryList;
		let regionLists = this.state.regionLists;

		const removeCountry = (country: string) => {
			countries = countries.filter((c: IGeoCountry) => c.country_code !== country);
			if (regions[country]) {
				delete regions[country];
			}
			countryList[countryList.findIndex((x: IGeoCountry) => x.country_code === country)].disabled = false;
		}

		const removeRegion = (c: string, r: number) => {
			if (regions[c]) {
				regionLists[c][regionLists[c].findIndex((x: IGeoRegion) => x.region_id === r)].disabled = false;
				regions[c] = regions[c].filter((region: IGeoRegion) => region.region_id !== r);
				if (!regions[c].length) {
					delete regions[c]
					removeCountry(c);
				}
			}
		}

		if (region_id) {
			removeRegion(country_code, region_id);
		} else {
			removeCountry(country_code);
		}

		this.setState({
			selectedCountries: countries,
			selectedRegions: regions,
			countryList: countryList,
			regionLists: regionLists
		});

		this.forceUpdate();
	}

	toggleFeatureIcon(icon: string) {

		let selectedEventFeatures = this.state.selectedEventFeatures;
		let iconIndex = selectedEventFeatures.indexOf(icon);

		if (iconIndex === -1) {
			selectedEventFeatures.push(icon);
		} else {
			selectedEventFeatures.splice(iconIndex,1);
		}

		this.setState({
			selectedEventFeatures: selectedEventFeatures,
		});

	}

	componentDidMount() {
		window.scrollTo(0,0);
		this.props.changePage("search");
		this.props.setMenuState(false);
	}

	render() {

		return (

			<React.Fragment>
				<h1>Search Events</h1>

				{ this.state.loading ?
					<div className="loader"></div>
				:
					<React.Fragment>
						<div className="searchForm">
							<div className="searchDatesLocations">
								<div className="searchDates">
									<p className="dateRange">
										<strong>Filter by Date:</strong>
										{this.state.dateRangeDisplay}
										{(this.state.dateRangeDisplay || this.state.startDate) && !this.state.endDate ? " – (all)" : ""} 
										{this.state.startDate && this.state.endDate && this.state.startDate._d === this.state.endDate._d ? " (only)" : ""} 
										{this.state.startDate ?
											<button className="smallButton" onClick={this.clearDates}>Clear dates</button>
										: ""
										}
									</p>
{1 ?
									<DayPickerRangeController
										startDate={this.state.startDate}
										endDate={this.state.endDate}
										focusedInput={this.state.focusedInput}
										hideKeyboardShortcutsPanel={true}
										numberOfMonths={1}
										enableOutsideDays={false}
										isOutsideRange={this.isBeforeToday}
										keepOpenOnDateSelect={true}
										minimumNights={0}
										onDatesChange={(dates:  {startDate: moment.Moment, endDate: moment.Moment}) => this.onDatesChange(dates) }
										onFocusChange={(focusedInput: string) => this.setState({ focusedInput: focusedInput })}
									/>
: ""}
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
										isOptionDisabled={(option: IGeoCountry) => option.disabled}
										getOptionLabel={(option: IGeoCountry) => option.country_name}
										isSearchable={true}
										isClearable={true}
									/>

									{true || this.state.countrySelectValue ?
										<div className="locationButton">
											<button className="smallButton" 
												disabled={!this.state.countrySelectValue || this.state.selectedRegions[this.state.countrySelectValue.country_code]} 
												onClick={() => {this.addLocation(this.state.countrySelectValue)}}>Add Country to Location List</button>
										</div>
									: ""
									}

									{true || (this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code]) ?

										<React.Fragment>
											<p className="selectChoiceText">or select region (if applicable):</p>
											<Select
												className="Select searchSelectRegions"
												classNamePrefix="Select"
												name="search-countries"
												value={this.state.regionSelectValue}
												isDisabled={!(this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code])}
												onChange={this.changeRegionSelect}
												options={this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code] ? this.state.regionLists[this.state.countrySelectValue.country_code] : [] } 
												isOptionDisabled={(option: IGeoRegion) => option.disabled}
												getOptionLabel={(option: IGeoRegion) => option.region_name}
												isSearchable={true}
												isClearable={true}
											/>
										{true || this.state.regionSelectValue ?
											<div className="locationButton">
												<button className="smallButton" disabled={!this.state.regionSelectValue} onClick={() => {this.addLocation(this.state.countrySelectValue, this.state.regionSelectValue)}}>Add Region to Location List</button>
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
														return -1
													} else if (a.country_name > b.country_name) {
														return 1
													} else {
														return 0
													}
												}).map((country: IGeoCountry) => (
													<li key={country.country_code}>
														{country.country_name} <span title={country.country_name} className={"flag-icon flag-icon-" + country.country_flag}></span>
														<button className="smallButton" title={"remove" + country.country_name} onClick={() => {this.removeLocation(country.country_code)}}>x</button>
														{this.state.selectedRegions[country.country_code] ?
															<ul className={"selectedRegions" + country.country_code}>
															{this.state.selectedRegions[country.country_code].sort((a: IGeoRegion, b: IGeoRegion) => {
																if (a.region_name < b.region_name) {
																	return -1
																} else if (a.region_name > b.region_name) {
																	return 1
																} else {
																	return 0
																}
															}).map((region: IGeoRegion) => (
																<li key={region.region_id}>
																	{region.region_name}
																	<button className="smallButton" title={"remove" + region.region_name} onClick={() => {this.removeLocation(region.region_country, region.region_id)}}>x</button>
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
								<div className="searchFeatures">
									{(this.state.eventFeatures.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											<span className="label">Filter Tracks</span>
											{this.state.eventFeatures.tracks.map((icon: IDerbyTrack) => (
												<img className={this.state.selectedEventFeatures.indexOf("tracks-" + icon.track_id) > -1 ? "selected" : ""} onClick={() => {this.toggleFeatureIcon("tracks-" + icon.track_id.toString())}} src={"/images/track-" + icon.track_abbreviation + ".svg"} title={icon.title} alt={icon.track_name} key={icon.track_id} />
											))}
										</span>
										: "" )}
									{(this.state.eventFeatures.derbytypes.length ?
										<span className="eventIconGroup eventIconIDerbytypes">
											<span className="label">Filter IDerby Types</span>
											{this.state.eventFeatures.derbytypes.map((icon: IDerbyType) => (
												<img className={this.state.selectedEventFeatures.indexOf("derbytypes-" + icon.derbytype_id) > -1 ? "selected" : ""} onClick={() => {this.toggleFeatureIcon("derbytypes-" + icon.derbytype_id)}} src={"/images/derbytype-" + icon.derbytype_abbreviation + ".svg"} title={icon.title} alt={icon.derbytype_name} key={icon.derbytype_id} />
											))}
										</span>
										: "" )}
									{(this.state.eventFeatures.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											<span className="label">Filter Sanctions</span>
											{this.state.eventFeatures.sanctions.map((icon: IDerbySanction) => (
												<img className={this.state.selectedEventFeatures.indexOf("sanctions-" + icon.sanction_id) > -1 ? "selected" : ""} onClick={() => {this.toggleFeatureIcon("sanctions-" + icon.sanction_id)}} src={"/images/sanction-" + icon.sanction_abbreviation + ".svg"} title={icon.title} alt={icon.sanction_name} key={icon.sanction_id} />
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

	submitSearch() {
		let searchURL = "/events";
		let queryString = "";
		let eventFeatures: {
			derbytypes: string[],
			sanctions: string[],
			tracks: string[],
			[key: string]: any,
		} = {
			derbytypes: [],
			sanctions: [],
			tracks: []
		};

		if (this.state.startDateString) {
			searchURL += `/${this.state.startDateString}`;
		}
		if (this.state.endDateString) {
			searchURL += `/${this.state.endDateString}`;
		}

		if (this.state.selectedCountries.length) {
			let locationString = "";

			for (let country = 0; country < this.state.selectedCountries.length; country ++) {
				locationString += `${(country > 0 ? ";" : "")}${this.state.selectedCountries[country].country_code}`;

				if (this.state.selectedRegions[this.state.selectedCountries[country].country_code]) {
					locationString += `-${this.state.selectedRegions[this.state.selectedCountries[country].country_code].map((reg: IGeoRegion) => (reg.region_id)).join(",")}`;
				}

			}

			queryString += `${(queryString ? "&" : "?")}locations=${locationString}`;
		}

		for (let event = 0; event < this.state.selectedEventFeatures.length; event ++) {
			let pieces: string[] = this.state.selectedEventFeatures[event].split("-");
			eventFeatures[pieces[0]].push(pieces[1]);
		}
		for (let feature in eventFeatures) {
			if (eventFeatures[feature].length) {
				queryString += `${(queryString ? "&" : "?")}${feature}=${eventFeatures[feature].join(",")}`;
			}
		}

		this.props.history.push(searchURL + queryString);

	}


}

