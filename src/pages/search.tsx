import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import axios from "axios";

import "react-dates/initialize";
import { DayPickerRangeController } from "react-dates";
import moment from "moment";

import Select from "react-select";

import { formatDateRange } from "lib/dateTime";

export default class Search extends React.Component {

	constructor(props) {
		super(props);

		this.today = new Date();

		this.state = {
			loading: true,
			startDate: null,
			endDate: null,
			startDateString: null,
			endDateString: null,
			dateRangeDisplay: formatDateRange({
				firstDay: {
					start: this.today.getFullYear().toString() + "-"
						+ ("0" + (this.today.getMonth() + 1)).toString().slice(-2) + "-"
						+ ("0" + this.today.getDate().toString()).slice(-2)
				},
				lastDay: {
					start: null
				}
			}),
			focusedInput: "startDate",
			countryList: [],
			regionLists: {},
			countrySelectValue: null,
			selectedCountries: [],
			regionSelectValue: null,
			selectedRegions: {},
			eventFeatures: {},
			selectedEventFeatures: [],
			selectedEventFeaturesCount: 0
		}

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

		let promises = [];
		let countryList = [];
		let regionLists = {};
		let eventFeatures = {};

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "geography/getAllCountries")
				.then(result => {
					countryList = result.data.response;

					let regionPromises = [];
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
					eventFeatures.tracks = result.data.response;
					resolve();
				}
			);
		}));

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "eventFeatures/getDerbyTypes")
				.then(result => {
					eventFeatures.derbytypes = result.data.response;
					resolve();
				}
			);
		}));

		promises.push(new Promise((resolve, reject) => {
			axios.get(this.props.apiLocation + "eventFeatures/getSanctionTypes")
				.then(result => {
					eventFeatures.sanctions = result.data.response;
					resolve(eventFeatures);
				}
			);
		}));

		Promise.all(promises).then(() => {

			this.setState({
				countryList: countryList,
				regionLists: regionLists,
				eventFeatures: eventFeatures,
				loading: false
			});

			let startState = {};

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
						firstDay: {
							start: parts[1] || null
						},
						lastDay: {
							start: parts[2] || null
						}
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
									let country = countryList.filter((c) => c.country_code === loc[0])[0];

									if (loc.length > 1) {
										let regions = loc[1].split(",");

										for (let reg = 0; reg < regions.length; reg ++) {

											if (regionLists[loc[0]]) {
												this.addLocation(country, 
													regionLists[loc[0]].filter((r) => r.region_id === Number(regions[reg]))[0]);
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
									features.push(param[0] + "-" + values[v]);
								}
							break;
						}
					}

					startState.selectedEventFeatures = features;
					startState.selectedEventFeaturesCount = features.length;
				}
			}

			this.setState(startState);

		});

	}

	isBeforeToday(date) {
		let todaysDate = new Date(this.today.getFullYear(),this.today.getMonth(),this.today.getDate(),0,0,0);

		let day = date._d;
		day.setHours(0);
		day.setMinutes(0);
		day.setSeconds(0);

		return day < todaysDate; 
	}

	clearDates() {
		this.setState({
			dateRangeDisplay: formatDateRange({
				firstDay: {
					start: this.today.getFullYear().toString() + "-"
						+ ("0" + (this.today.getMonth() + 1)).toString().slice(-2) + "-"
						+ ("0" + this.today.getDate().toString()).slice(-2)
				},
				lastDay: {
					start: null
				}
			}),
			startDate: null, 
			endDate: null,
			startDateString: null,
			endDateString: null,
			focusedInput: "startDate"
		});
	}

	onDatesChange(startDate, endDate) {
		this.setState({
			dateRangeDisplay: formatDateRange({
				firstDay: {
					start: startDate ? startDate._d
					: this.today.getFullYear().toString() + "-"
						+ ("0" + (this.today.getMonth() + 1)).toString().slice(-2) + "-"
						+ ("0" + this.today.getDate().toString()).slice(-2)				
				},
				lastDay: {
					start: endDate ? endDate._d : null
				}
			}),
			startDateString: startDate ? 
				startDate._d.getFullYear().toString() + "-" 
					+ ("0" + (startDate._d.getMonth() + 1)).toString().slice(-2) + "-"
					+ ("0" + startDate._d.getDate().toString()).slice(-2) 
				: null,
			endDateString: endDate ? 
				endDate._d.getFullYear().toString() + "-" 
					+ ("0" + (endDate._d.getMonth() + 1)).toString().slice(-2) + "-" 
					+ ("0" + endDate._d.getDate().toString()).slice(-2)
				: null,
			startDate: startDate, 
			endDate: endDate 
		});
	}

	changeCountrySelect(country) {
		this.setState({
			countrySelectValue: Object.assign({disabled: true}, country)
		});
	}

	changeRegionSelect(country) {
		this.setState({
			regionSelectValue: country
		});
	}

	addLocation(country, region) {
		let countries = this.state.selectedCountries;
		let regions = this.state.selectedRegions;
		let countryList = this.state.countryList;
		let regionLists = this.state.regionLists;
		let newState = {};

		const addCountry = c => {
			countries = countries.concat([c]);
			if(!regions[c.country_code]) {
				countryList[countryList.findIndex(x => x.country_code === c.country_code)].disabled = true;
			}
		}

		const addRegion = (c,r) => {
			if (!regions[r.region_country]) {
				regions[r.region_country] = [];
				addCountry(c);
			}
			regions[r.region_country].push(r);
			regionLists[r.region_country][regionLists[r.region_country].findIndex(x => x.region_id === r.region_id)].disabled = true;
		}

		if (region) {
			addRegion(country, region);
		} else {
			addCountry(country);
		}

		newState = {
			selectedRegions: regions,
			selectedCountries: countries,
			countryList: countryList,
			regionLists: regionLists
		};

		if (region) {
			newState.regionSelectValue = null;
		} else {
			newState.countrySelectValue = null;
		}

		this.setState(newState);	

	}

	removeLocation(country_code, region_id) {
		let countries = this.state.selectedCountries;
		let regions = this.state.selectedRegions;
		let countryList = this.state.countryList;
		let regionLists = this.state.regionLists;

		const removeCountry = c => {
			countries = countries.filter(country => country.country_code !== c);
			if (regions[c]) {
				delete regions[c];
			}
			countryList[countryList.findIndex(x => x.country_code === c)].disabled = false;
		}

		const removeRegion = (c,r) => {
			if (regions[c]) {
				regionLists[c][regionLists[c].findIndex(x => x.region_id === r)].disabled = false;
				regions[c] = regions[c].filter(region => region.region_id !== r);
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

	toggleFeatureIcon(icon) {

		let selectedEventFeatures = this.state.selectedEventFeatures;
		let iconIndex = selectedEventFeatures.indexOf(icon);

		if (iconIndex === -1) {
			selectedEventFeatures.push(icon);
		} else {
			selectedEventFeatures.splice(iconIndex,1);
		}

		this.setState({
			selectedEventFeatures: selectedEventFeatures,
			selectedEventFeaturesCount: selectedEventFeatures.length
		});

	}
/*
	shouldComponentUpdate(nextProps, nextState) {
		if (this.state.loading !== nextState.loading
			|| this.state.dataError !== nextState.dataError
			|| this.state.selectedEventFeaturesCount !== nextState.selectedEventFeaturesCount
			|| this.state.focusedInput !== nextState.focusedInput
			|| this.state.startDate !== nextState.startDate
			|| this.state.endDate !== nextState.endDate
			|| this.state.countrySelectValue !== nextState.countrySelectValue
			|| this.state.regionSelectValue !== nextState.regionSelectValue
			|| this.state.selectedCountries.length !== nextState.selectedCountries.length
			|| Object.keys(this.state.selectedRegions).length !== Object.keys(nextState.selectedRegions).length
		) {
			return true;
		}

		return false;
	}
*/
	componentDidMount() {
		window.scrollTo(0,0);
		this.props.changePage("search");
		this.props.setMenuState(false);
	}

	render() {

		// console.log(this.state);

		return (

			<React.Fragment>
				<h1>Search Events</h1>

				{ this.loading ?
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
										onDatesChange={({ startDate, endDate }) => this.onDatesChange(startDate, endDate)}
										onFocusChange={focusedInput => this.setState({ focusedInput: focusedInput })}
									/>
: ""}
								</div>

								<div className="searchLocations">
									<p><strong>Filter by Location</strong></p>

									<Select
										className="searchSelectCountries"
										name="search-countries"
										value={this.state.countrySelectValue}
										onChange={this.changeCountrySelect}
										options={this.state.countryList}
										labelKey="country_name"
										searchable={true}
										clearable={true}
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
												className="searchSelectRegions"
												name="search-countries"
												value={this.state.regionSelectValue}
												disabled={!(this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code])}
												onChange={this.changeRegionSelect}
												options={this.state.countrySelectValue && this.state.regionLists[this.state.countrySelectValue.country_code] ? this.state.regionLists[this.state.countrySelectValue.country_code] : [] } 
												labelKey="region_name"
												searchable={true}
												clearable={true}
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
												{this.state.selectedCountries.sort((a,b) => {
													if (a.country_name < b.country_name) {
														return -1
													} else if (a.country_name > b.country_name) {
														return 1
													} else {
														return 0
													}
												}).map(country => (
													<li key={country.country_code}>
														{country.country_name} <span title={country.country_name} className={"flag-icon flag-icon-" + country.country_flag}></span>
														<button className="smallButton" title={"remove" + country.country_name} onClick={() => {this.removeLocation(country.country_code)}}>x</button>
														{this.state.selectedRegions[country.country_code] ?
															<ul className={"selectedRegions" + country.country_code}>
															{this.state.selectedRegions[country.country_code].sort((a,b) => {
																if (a.region_name < b.region_name) {
																	return -1
																} else if (a.region_name > b.region_name) {
																	return 1
																} else {
																	return 0
																}
															}).map(region => (
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
									{this.state.selectedEventFeatures.value}
									{(this.state.eventFeatures.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											<span className="label">Filter Tracks</span>
											{this.state.eventFeatures.tracks.map(icon => (
												<img className={this.state.selectedEventFeatures.indexOf("tracks-" + icon.track_id) > -1 ? "selected" : ""} onClick={() => {this.toggleFeatureIcon("tracks-" + icon.track_id)}} src={"/images/track-" + icon.track_abbreviation + ".svg"} title={icon.title} alt={icon.track_name} key={icon.track_id} />
											))}
										</span>
										: "" )}
									{(this.state.eventFeatures.derbytypes.length ?
										<span className="eventIconGroup eventIconDerbytypes">
											<span className="label">Filter Derby Types</span>
											{this.state.eventFeatures.derbytypes.map(icon => (
												<img className={this.state.selectedEventFeatures.indexOf("derbytypes-" + icon.derbytype_id) > -1 ? "selected" : ""} onClick={() => {this.toggleFeatureIcon("derbytypes-" + icon.derbytype_id)}} src={"/images/derbytype-" + icon.derbytype_abbreviation + ".svg"} title={icon.title} alt={icon.derbytype_name} key={icon.derbytype_id} />
											))}
										</span>
										: "" )}
									{(this.state.eventFeatures.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											<span className="label">Filter Sanctions</span>
											{this.state.eventFeatures.sanctions.map(icon => (
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
		let eventFeatures = {
			tracks: [],
			derbytypes: [],
			sanctions: []
		}

		if (this.state.startDateString) {
			searchURL += "/" + this.state.startDateString;
		}
		if (this.state.endDateString) {
			searchURL += "/" + this.state.endDateString;
		}

		if (this.state.selectedCountries.length) {
			let locationString = "";

			for (let c = 0; c < this.state.selectedCountries.length; c ++) {
				locationString += (c > 0 ? ";" : "") + this.state.selectedCountries[c].country_code;

				if (this.state.selectedRegions[this.state.selectedCountries[c].country_code]) {
					locationString += "-" + this.state.selectedRegions[this.state.selectedCountries[c].country_code].map(reg => (reg.region_id)).join(",");
				}

			}

			queryString += (queryString ? "&" : "?") + "locations=" + locationString;
		}

		for (let e = 0; e < this.state.selectedEventFeatures.length; e ++) {
			let pieces = this.state.selectedEventFeatures[e].split("-");
			eventFeatures[pieces[0]].push(pieces[1]);
		}
		for (let e in eventFeatures) {
			if (eventFeatures[e].length) {
				queryString += (queryString ? "&" : "?") + e + "=" + eventFeatures[e].join(",");
			}
		}

		this.props.history.push(searchURL + queryString);

	}


}

