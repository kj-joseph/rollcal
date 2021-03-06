import RCComponent from "components/rcComponent";
import React from "react";
import Select from "react-select";

import { DayPickerRangeController, FocusedInputShape } from "react-dates";
import "react-dates/initialize";

import { getFeatures } from "services/featureService";
import { getGeography } from "services/geoService";
import { getSearchUrl } from "services/searchService";
import { formatDateRange } from "services/timeService";

import AddressFields from "components/addressFields";
import FeatureIconSet from "components/featureIconSet";
import Flag from "components/flag";

import { ISearchObject } from "interfaces/event";
import { IDerbyFeatureType } from "interfaces/feature";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";

import moment from "moment";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IStartState {
	address1?: string;
	addressCity?: string;
	addressCountry?: IGeoCountry;
	addressPostcode?: string;
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
	addressPostcode: string;
	addressRegion: IGeoRegion;
	countryList: IGeoCountry[];
	countrySelectValue: IGeoCountry;
	dateRangeDisplay: string;
	distanceUnits: "mi" | "km";
	endDate: moment.Moment;
	featureLists: IDerbyFeatureType[];
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
		addressPostcode: "",
		addressRegion: {} as IGeoRegion,
		countryList: [],
		countrySelectValue: {} as IGeoCountry,
		dateRangeDisplay: formatDateRange({
			start: moment(),
		}),
		distanceUnits: "mi",
		endDate: null,
		featureLists: [],
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

			<>
				<h1>Search Events</h1>

				{ this.state.loading ?
					<div className="loader" />
				:
					<>
						<div className="searchForm">
							<div className="searchDatesLocations">

								<div className="searchDates">
									<p className="dateRange">
										<strong>Filter by Date:</strong>
										{this.state.dateRangeDisplay}
										{(this.state.dateRangeDisplay || this.state.startDate) && !this.state.endDate ?
											" – (all)"
										: null}
										{this.state.startDate && this.state.endDate && this.state.startDate.format("Y-MM-DD") === this.state.endDate.format("Y-MM-DD") ?
											" (only)"
										: null}
										{this.state.startDate ?
											<>
												<br />
												<button className="smallButton" onClick={this.clearDates}>Clear dates</button>
											</>
										: null}
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

										<div className="inputGroup">
											<label htmlFor="searchSelectCountries">Select a country:</label>
											<Select
												className="Select"
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
													Add {this.state.countrySelectValue ?
														this.state.countrySelectValue.name
													: null} to Location List
												</button>
											</div>
										: null}

										{(this.state.countrySelectValue
											&& this.state.countrySelectValue.regions
											&& this.state.countrySelectValue.regions.length) ?

											<>
												<div className="inputGroup">
													<label htmlFor="searchSelectRegions">or select a {this.state.countrySelectValue.regionType}:</label>

													<Select
														className="Select"
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
														Add {this.state.regionSelectValue ?
															this.state.regionSelectValue.name
														: null} to Location List
													</button>
												</div>

											</>

										: null}

										<div className="selectedLocationsContainer">

											<p className="selectedLocationsHeader">Selected Locations</p>

											<ul className="selectedLocations">
												{!this.state.selectedLocations.length ?
													<li>All</li>
												:
													<>

														{this.state.selectedLocations
															.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
															.map((country) => (

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
																		{country.regions
																			.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
																			.map((region) => (

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

																: null}

															</li>
														))}
													</>
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

										<AddressFields
											prefix="address"
											address1={({
												handler: this.handleInputChange,
												stateVar: "address1",
												value: this.state.address1,
											})}
											city={({
												handler: this.handleInputChange,
												stateVar: "addressCity",
												value: this.state.addressCity,
											})}
											country={({
												handler: this.handleAddressCountryChange,
												label: this.getCountryOptionLabel,
												list: this.state.countryList,
												value: this.state.addressCountry,
											})}
											region={({
												handler: this.handleAddressRegionChange,
												label: this.getRegionOptionLabel,
												value: this.state.addressRegion,
											})}
											postcode={({
												handler: this.handleInputChange,
												stateVar: "addressPostcode",
												value: this.state.addressPostcode,
											})}
										/>


									</div>

								: null}

							</div>

							{this.state.featureLists && this.state.featureLists.length ?

								<FeatureIconSet
									data={this.state.featureLists}
									labels={{
										derbytype: ["Filter Derby Types:"],
										sanction: ["Filter Sanctions:"],
										track: ["Filter Tracks:"],
									}}
									selected={this.state.selectedFeatures}
									toggle={this.toggleFeatureIcon}
								/>


							: null}

						</div>

						<div className="searchButtons">
							<button
								className="largeButton"
								onClick={this.submitSearch}
								disabled={
									this.state.locationTab === "distance"
									&& (!this.state.searchDistance
										|| !this.state.address1
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

					</>
				}

			</>
		);

	}

	addCountry(event: React.MouseEvent<HTMLButtonElement>): void {
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

	addRegion(event: React.MouseEvent<HTMLButtonElement>): void {
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

	changeCountrySelect(country: IGeoCountry): void {

		this.setState({
			countrySelectValue: country || {} as IGeoCountry,
			regionSelectValue: {} as IGeoRegion,
		});

	}

	changeLocationTab(event: React.MouseEvent<HTMLSpanElement>): void {

		event.preventDefault();

		this.setState({
			locationTab: event.currentTarget.dataset.tab,
		});

	}

	changeUnits(event: React.MouseEvent<HTMLSpanElement>): void {

		event.preventDefault();

		this.setState({
			distanceUnits: event.currentTarget.dataset.unit,
		});

	}

	changeRegionSelect(region: IGeoRegion): void {

		this.setState({
			regionSelectValue: region || {} as IGeoRegion,
		});

	}

	clearDates(): void {

		this.setState({
			dateRangeDisplay: formatDateRange({
				start: moment(),
			}),
			endDate: null,
			focusedInput: "startDate",
			startDate: null,
		});

	}

	determineStartMonth(): moment.Moment {

		if (this.state.startDate) {
			return this.state.startDate;
		} else {
			return moment();
		}

	}

	getCountryOptionLabel(option: IGeoCountry): string {

		return option.name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion): string {

		return option.name || "(type here to search list)";

	}

	handleAddressCountryChange(country: IGeoCountry): void {

		this.setState({
			addressCountry: country || {} as IGeoCountry,
			addressRegion: {} as IGeoRegion,
		});

	}

	handleAddressRegionChange(region: IGeoRegion): void {

		this.setState({
			addressRegion: region || {} as IGeoRegion,
		});

	}

	handleFocusChange(focusedInput: FocusedInputShape): void {

		this.setState({ focusedInput });

	}

	handleInputChange <T extends keyof ISearchState>(event: React.ChangeEvent<HTMLInputElement>): void {

		const fieldName: (keyof ISearchState) =
			event.currentTarget.dataset.statevar ?
				event.currentTarget.dataset.statevar as (keyof ISearchState)
			: event.currentTarget.name as (keyof ISearchState);
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

	isBeforeToday(date: moment.Moment): boolean {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const day = date.hours(0).minute(0).seconds(0);

		return day < todaysDate;
	}

	isCountryOptionDisabled(option: IGeoCountry): boolean {

		return option.disabled;

	}

	isRegionOptionDisabled(option: IGeoRegion): boolean {

		return option.disabled;
	}

	onDatesChange(dates: {startDate: moment.Moment, endDate: moment.Moment}): void {

		this.setState({
			dateRangeDisplay: formatDateRange({
				end: dates.endDate ? dates.endDate : null,
				start: dates.startDate ? dates.startDate : moment(),
			}),
			endDate: dates.endDate,
			startDate: dates.startDate,
		});

	}

	removeCountry(event: React.MouseEvent<HTMLDivElement>): void {

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

	removeRegion(event: React.MouseEvent<HTMLDivElement>): void {

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

	renderMonthHeader(date: {month: moment.Moment}): JSX.Element {

		return (
			<>
				<span className="monthLong">{date.month.format("MMMM")}</span><span className="monthShort">{date.month.format("MMM")}</span> {date.month.format("Y")}
			</>
		);

	}

	toggleFeatureIcon(event: React.MouseEvent<HTMLDivElement>): void {

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

	submitSearch(): void {

		const searchObject: ISearchObject = {};

		if (this.state.startDate) {

			searchObject.startDate =  this.state.startDate.format("Y-MM-DD");

		}

		if (this.state.endDate) {

			searchObject.endDate =  this.state.endDate.format("Y-MM-DD");

		}

		if (this.state.locationTab === "locations" && this.state.selectedLocations.length) {

			searchObject.locations = this.state.selectedLocations;

		} else if (this.state.locationTab === "distance") {

			searchObject.address = (`distance(${this.state.address1
				}~${this.state.addressCity
				}~${this.state.addressRegion.abbreviation || ""
				}~${this.state.addressPostcode || ""
				}~${this.state.addressCountry.code
				}~${this.state.searchDistance
				}~${this.state.distanceUnits})`);
			searchObject.distance = this.state.searchDistance;
			searchObject.distanceUnits = this.state.distanceUnits;

		}

		searchObject.features = this.state.selectedFeatures;

		this.props.history.push(getSearchUrl(searchObject));

	}

	loadData(): void {

		const getData = this.addPromise(
			Promise.all([
				getGeography(),
				getFeatures(),
			]));

		getData
			.then((data: [
				IGeoCountry[],
				IDerbyFeatureType[]
			]) => {

				const [
					countryList,
					featureLists,
				]
					= data;

				this.setState({
					countryList,
					featureLists,
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

					if (this.props.lastSearch.features) {

						startState.selectedFeatures = this.props.lastSearch.features;

					}

					if (this.props.lastSearch.address && this.props.lastSearch.distanceUnits) {

						const [
							address1,
							city,
							regionAbbr,
							postcode,
							countryCode,
							distanceString,
							distanceUnits,
						]
							= this.props.lastSearch.address.split("~");

						const country = countryList.filter((c) => c.code === countryCode)[0];

						Object.assign(startState, {
							address1,
							addressCity: city,
							addressCountry: country,
							addressPostcode: postcode,
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

			})
			.catch((error) => {

				console.error(error);

			})
			.finally(getData.clear);

	}

}
