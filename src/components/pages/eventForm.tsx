import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyEvent, IDBDerbyVenue,
	IDerbyEvent, IDerbyEventDayFormatted,
	IDerbySanction, IDerbyTrack, IDerbyType,
	IDerbyVenue,
	IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList, ITimeZone,
	} from "components/interfaces";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography, getTimeZones } from "components/lib/data";

import axios, { AxiosError, AxiosResponse } from "axios";

import { DayPickerSingleDateController  } from "react-dates";
import "react-dates/initialize";

import moment from "moment";

import Select from "react-select";

import FeatureIcon from "components/partials/featureIcon";

export default class EventForm<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			addDayOpen: false,
			countryList: [] as IGeoCountry[],
			countrySelectValue: {} as IGeoCountry,
			dataError: false,
			eventData: {} as IDerbyEvent,
			focused: true,
			initialEventData: {} as IDerbyEvent,
			initialSelectedFeatures: [] as string[],
			loading: true,
			newDayDate: "",
			newDayDescription: "",
			newDayDoors: "",
			newDayTime: "",
			newVenueAddress1: "",
			newVenueAddress2: "",
			newVenueCity: "",
			newVenueCountry: "",
			newVenueDescription: "",
			newVenueLink: "",
			newVenueName: "",
			newVenuePostcode: "",
			newVenueRegion: 0,
			newVenueTimeZone: {} as ITimeZone,
			pageFunction: this.props.match.params.operation === "add" ? "Add New Event" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.eventId
					&& this.props.match.params.eventId.match(/[0-9]+/)
					? "Edit Event" : "Error",
			processing: false,
			regionLists: {} as IGeoRegionList,
			regionSelectValue: null as IGeoRegion[],
			sectionOpenBasic: true,
			sectionOpenDays: true,
			sectionOpenFeatures: true,
			sectionOpenVenue: true,
			selectedFeatures: [] as string[],
			selectedVenue: {} as IDerbyVenue,
			timeZoneList: [],
			venueList: [],
		};

		this.determineStartMonth = this.determineStartMonth.bind(this);
		this.handleFocusChange = this.handleFocusChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
		this.handleVenueChange = this.handleVenueChange.bind(this);
		this.onDateChange = this.onDateChange.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
		this.toggleSection = this.toggleSection.bind(this);

	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			this.setState({
				path: window.location.pathname,
			});
			this.loadData();

		}
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	render() {

		return (
			<div className="eventForm">

				<p className="backToSearch">
					<Link to="/dashboard/events">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div>

					<h1>{this.state.pageFunction}</h1>

					{this.state.loading || this.state.processing ?

						<div className="loader" />

					: this.state.dataError ?

						<div className="eventDetails">
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<form
							className="entryForm"
							id="accountForm"
							onSubmit={this.submitEventForm}
						>

							<p><strong>IMPORTANT!</strong> Make sure to click the save button at the bottom of the form to save your changes.</p>

							<div>

								<h3
									className={"formSectionHeader"
										+ (this.state.sectionOpenBasic ? " open" : " closed")
										+ (this.state.eventData.host ? " ok" : "")}
									data-section="Basic"
									onClick={this.toggleSection}
								>
									Basic Event Information
								</h3>

								<div className={"formSection" + (this.state.sectionOpenBasic ? " open" : " closed")}>

									<div className="inputGroup">
										<label htmlFor="name">Event Name <em>(optional)</em></label>
										<input
											id="name"
											name="name"
											data-handler="eventData"
											type="text"
											required={false}
											value={this.state.eventData.name}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="host">Host</label>
										<input
											id="host"
											name="host"
											data-handler="eventData"
											type="text"
											required={true}
											value={this.state.eventData.host}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="event_link">Web Page <em>(optional)</em></label>
										<input
											id="event_link"
											name="event_link"
											data-handler="eventData"
											type="url"
											required={false}
											value={this.state.eventData.event_link}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="event_description">Description <em>(recommended, but optional)</em></label>
										<textarea
											id="event_description"
											name="event_description"
											data-handler="eventData"
											required={false}
											value={this.state.eventData.event_description}
											onChange={this.handleInputChange}
										/>
									</div>

								</div>

							</div>

							<div>

								<h3
									className={"formSectionHeader"
										+ (this.state.sectionOpenVenue ? " open" : " closed")
										+ (this.state.eventData.venue
											|| (this.state.newVenueName
												&& this.state.newVenueAddress1
												&& this.state.newVenueCity
												&& this.state.newVenueTimeZone.timezone_id)
										 ? " ok" : "")}
									data-section="Venue"
									onClick={this.toggleSection}
								>
									Venue
								</h3>

								<div className={"formSection" + (this.state.sectionOpenVenue ? " open" : " closed")}>

									<Select
										className="Select"
										classNamePrefix="Select"
										name="venue"
										value={this.state.selectedVenue}
										onChange={this.handleVenueChange}
										options={this.state.venueList}
										getOptionLabel={this.getVenueLabel}
										isSearchable={true}
										isClearable={true}
									/>

									{this.state.eventData.venue === 0 ?

										<React.Fragment>

											<div className="inputGroup">
												<label htmlFor="newVenueName">Name</label>
												<input
													id="newVenueName"
													name="newVenueName"
													data-handler="newVenue"
													type="url"
													required={true}
													value={this.state.eventData.newVenueName}
													onChange={this.handleInputChange}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="newVenueAddress1">Street Address</label>
												<input
													id="newVenueAddress1"
													name="newVenueAddress1"
													data-handler="newVenue"
													type="url"
													required={true}
													value={this.state.eventData.newVenueAddress1}
													onChange={this.handleInputChange}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="newVenueAddress2">Address Line 2 <em>(optional)</em></label>
												<input
													id="newVenueAddress2"
													name="newVenueAddress2"
													data-handler="newVenue"
													type="url"
													required={false}
													value={this.state.eventData.newVenueAddress2}
													onChange={this.handleInputChange}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="newVenueCity">City</label>
												<input
													id="newVenueCity"
													name="newVenueCity"
													data-handler="newVenue"
													type="url"
													required={true}
													value={this.state.eventData.newVenueCity}
													onChange={this.handleInputChange}
												/>
											</div>

											// country

											// region

											<div className="inputGroup">
												<label htmlFor="name">Time Zone</label>
												<Select
													className="Select"
													classNamePrefix="Select"
													name="venue"
													value={this.state.newVenueTimeZone}
													onChange={this.handleTimeZoneChange}
													options={this.state.timeZoneList}
													getOptionLabel={this.getTimeZoneLabel}
													isSearchable={true}
													isClearable={true}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="newVenueLink">Website <em>(optional)</em></label>
												<input
													id="newVenueLink"
													name="newVenueLink"
													data-handler="newVenue"
													type="url"
													required={true}
													value={this.state.eventData.newVenueLink}
													onChange={this.handleInputChange}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="event_description">Description <em>(optional)</em></label>
												<textarea
													id="newVenueDescription"
													name="newVenueDescription"
													data-handler="newVenue"
													required={false}
													value={this.state.eventData.event_description}
													onChange={this.handleInputChange}
												/>
											</div>

										</React.Fragment>


									: ""}

								</div>

							</div>

							<div>

								<h3
									className={"formSectionHeader"
										+ (this.state.sectionOpenDays ? " open" : " closed")
										+ (this.state.eventData.days.length ? " ok" : "")}
									data-section="Days"
									onClick={this.toggleSection}
								>
									Event Days ({this.state.eventData.days.length})
								</h3>

								<div className={"formSection" + (this.state.sectionOpenDays ? " open" : " closed")}>

									<p>{this.state.date ? this.state.date.format("MMM D, YYYY") : ""}</p>

									<div className="eventDays">
										<ul className={"eventDayList" + (this.state.eventData.days.length ? "" : " empty")}>
											{this.state.eventData.days
												.sort((day1: IDerbyEventDayFormatted, day2: IDerbyEventDayFormatted) =>
													day1.date > day2.date ? 1 : day1.date < day2.date ? -1 : 0)
												.map((day: IDerbyEventDayFormatted) => (
												<li key={day.id} data-day-id={day.id} className={!day.editing ? "editing" : ""}>
													<dl>
														<dt>Date:</dt>
														<dd>{day.dateObject.format("MMM D, YYYY")}</dd>
														<dt>Start time:</dt>
														<dd>{day.startTime}</dd>
														<dt>Doors open:</dt>
														<dd>{day.doorsTime}</dd>
														<dt>Description:</dt>
														<dd>{day.description}</dd>
													</dl>

													<div className="dayForm">

														<div className="calendarContainer" data-day-id={day.id}>
															<DayPickerSingleDateController
																date={this.state.eventData.days.filter((eventDay: IDerbyEventDayFormatted) => eventDay.id === day.id)[0].dateObject}
																focused={this.state.focused}
																hideKeyboardShortcutsPanel={true}
																numberOfMonths={1}
																enableOutsideDays={false}
																initialVisibleMonth={() => this.determineStartMonth(
																	this.state.eventData.days.filter((eventDay: IDerbyEventDayFormatted) => eventDay.id === day.id)[0].dateObject)}
																isOutsideRange={this.isBeforeToday}
																keepOpenOnDateSelect={true}
																onDateChange={(date: moment.Moment) => this.onDateChange(date, day.id)}
																onFocusChange={this.handleFocusChange}
																noBorder={true}
															/>
														</div>

														<div className="inputGroup third">
															<label htmlFor={`dayStartTime${day.id}`}>Start Time</label>
															<input
																id={`dayStartTime${day.id}`}
																name={`dayStartTime${day.id}`}
																data-handler="eventDay"
																data-day-id={day.id}
																type="time"
																required={false}
																value={this.state.newDayTime}
																onChange={this.handleInputChange}
															/>
														</div>

													</div>

													<div className="buttonRow operationButtons">
														<button className="smallButton" onClick={null}>Edit</button>
														<button className="smallButton" onClick={null}>Delete</button>
													</div>

													<div className="buttonRow editingButtons">
														<button className="smallButton" onClick={null}>Done</button>
														<button className="smallButton" onClick={null}>Cancel</button>
													</div>
												</li>
											))}
										</ul>

										<div className="buttonRow left">
											<button className="smallButton" onClick={null}>Add day</button>
										</div>

									</div>

								</div>

							</div>

							<div>

								<h3
									className={"formSectionHeader"
										+ (this.state.sectionOpenFeatures ? " open" : " closed")
										+ (this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "derbytype").length
											&& this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "track").length


											? " ok" : "")}
									data-section="Features"
									onClick={this.toggleSection}
								>
									Event Features ({this.state.selectedFeatures.length})
								</h3>

								<div className={"formSection" + (this.state.sectionOpenFeatures ? " open" : " closed")}>

									{this.state.eventFeatures.tracks ?
										<div className="derbyFeatures">
											{(this.state.eventFeatures.tracks.length ?
												<span className="eventIconGroup eventIconTracks">
													<span className="label">Tracks <em>(at least one)</em></span>
													{this.state.eventFeatures.tracks.map((icon: IDerbyTrack) => (
														<FeatureIcon
															imageClass={this.state.selectedFeatures.indexOf("track-" + icon.track_id) > -1 ? "selected" : ""}
															abbreviation={icon.track_abbreviation}
															alt={icon.track_name}
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
													<span className="label">Derby Types <em>(at least one)</em></span>
													{this.state.eventFeatures.derbytypes.map((icon: IDerbyType) => (
														<FeatureIcon
															imageClass={this.state.selectedFeatures.indexOf("derbytype-" + icon.derbytype_id) > -1 ? "selected" : ""}
															abbreviation={icon.derbytype_abbreviation}
															alt={icon.derbytype_name}
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
													<span className="label">Sanctions <em>(optional)</em></span>
													{this.state.eventFeatures.sanctions.map((icon: IDerbySanction) => (
														<FeatureIcon
															imageClass={this.state.selectedFeatures.indexOf("sanction-" + icon.sanction_id) > -1 ? "selected" : ""}
															abbreviation={icon.sanction_abbreviation}
															alt={icon.sanction_name}
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
									: "" }
								</div>

							</div>

						</form>

					}

				</div>
			</div>
		);

	}

	determineStartMonth(date: moment.Moment) {

		if (date) {
			return date;
		} else {
			return moment();
		}

	}

	getTimeZoneLabel(timezone: ITimeZone) {

		if (timezone && timezone.timezone_name) {
			return timezone.timezone_name;
		} else {
			return "(Type here to search time zones)";
		}

	}

	getVenueLabel(venue: IDerbyVenue) {

		if (venue && venue.name) {
			return `${venue.name} - ${venue.location}`;
		} else {
			return "(Type here to search venues)";
		}

	}

	handleFocusChange({ focused }: { focused: boolean }) {

		this.setState({ focused });

	}

	handleInputChange(event: React.ChangeEvent<any>) {

		switch (event.currentTarget.getAttribute("data-handler")) {

			case "eventData":
				const eventData = this.state.eventData;

				eventData[event.currentTarget.name] = event.currentTarget.value;

				this.setState({
					eventData,
				});

				break;

			case "newVenue":

				this.setState({
					[event.currentTarget.name]: event.currentTarget.value,
				});

				break;

			case "eventDay":

				break;

		}

	}

	handleTimeZoneChange(timezone: ITimeZone) {

		this.setState({
			newVenueTimeZone: timezone || {},
		});

	}

	handleVenueChange(venue: IDerbyVenue) {

		const eventData = this.state.eventData;

		eventData.venue = venue ? venue.id : null;

		this.setState({
			eventData,
			newVenueTimeZone: {},
			selectedVenue: venue || {},
		});

	}

	isBeforeToday(date: moment.Moment) {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const day = date.hours(0).minute(0).seconds(0);

		return day < todaysDate;
	}

	onDateChange(date: moment.Moment, id: number) {

		const eventData = this.state.eventData;
		const thisDay = eventData.days.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];
		const days = eventData.days.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		thisDay.dateObject = date;
		thisDay.day = date.format("MMM D, YYYY");

		days.push(thisDay);
		eventData.days = days;

		this.setState({
			eventData,
		});

	}

	toggleFeatureIcon(icon: string) {

		const selectedFeatures = this.state.selectedFeatures;
		const iconIndex = selectedFeatures.indexOf(icon);

		if (iconIndex === -1) {
			selectedFeatures.push(icon);
		} else {
			selectedFeatures.splice(iconIndex, 1);
		}

		this.setState({
			selectedFeatures,
		});

	}

	toggleSection(event: React.MouseEvent<HTMLHeadingElement>) {

		event.preventDefault();

		this.setState({
			[`sectionOpen${event.currentTarget.getAttribute("data-section")}`]: !this.state[`sectionOpen${event.currentTarget.getAttribute("data-section")}`],
		});

	}

	loadData() {

		let allVenues: IDerbyVenue[];
		let countryList: IGeoCountry[] = [];
		let eventSanctions: IDerbySanction[] = [];
		let eventTracks: IDerbyTrack[] = [];
		let eventTypes: IDerbyType[] = [];
		const promises: Array<Promise<any>> = [];
		let regionLists: IGeoRegionList = {};
		let selectedVenue = {} as IDerbyVenue;
		let timeZones: ITimeZone[] = [];

		promises.push(getGeography(this.props)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getTimeZones(this.props)
			.then((dataResponse: ITimeZone[]) => {
				timeZones = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbySanctions(this.props)
			.then((dataResponse: IDerbySanction[]) => {
				eventSanctions = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTracks(this.props)
			.then((dataResponse: IDerbyTrack[]) => {
				eventTracks = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTypes(this.props)
			.then((dataResponse: IDerbyType[]) => {
				eventTypes = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(
			axios.get(`${this.props.apiLocation}venues/getAllVenues`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					allVenues = result.data
						.map((venue: IDBDerbyVenue) => ({
							city: venue.venue_city,
							country: venue.venue_country,
							id: venue.venue_id,
							location: `${venue.venue_city}${venue.region_abbreviation ? ", " + venue.region_abbreviation : ""}, ${venue.venue_country}`,
							name: venue.venue_name,
							region: venue.venue_region,
							user: venue.venue_user,
						}));

					allVenues.unshift({
						id: 0,
						location: "fill form below)",
						name: "(Add new venue",
					} as IDerbyVenue);

				}).catch((error: AxiosError) => {
					console.error(error);

					this.setState({
						dataError: true,
						loading: false,
					});

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
				timeZoneList: timeZones,
				venueList: allVenues,
			});

			if (this.props.match.params.eventId) {

				axios.get(`${this.props.apiLocation}events/getEventDetails/${this.props.match.params.eventId}`, { withCredentials: true })
					.then((result: AxiosResponse) => {

						if (result.data && result.data.user_id === this.props.loggedInUserId) {

							const eventResult: IDBDerbyEvent = result.data;

							const eventDays = [] as IDerbyEventDayFormatted[];
							for (const day of eventResult.days) {
								eventDays.push({
									date: moment.utc(day.eventday_start_venue).format("MMM D, YYYY"),
									dateObject: moment.utc(day.eventday_start_venue),
									description: day.eventday_description,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("h:mm a")
										: "",
									editing: false,
									id: day.eventday_id,
									startTime: moment.utc(day.eventday_start_venue).format("h:mm a"),
								});
							}

							const selectedFeatures = [] as string[];

							if (eventResult.derbytypes) {

								for (const derbytype of eventResult.derbytypes.split(",")) {
									selectedFeatures.push(`derbytype-${derbytype.trim()}`);
								}

							}

							if (eventResult.sanctions) {

								for (const sanction of eventResult.sanctions.split(",")) {
									selectedFeatures.push(`sanction-${sanction.trim()}`);
								}

							}

							if (eventResult.tracks) {

								for (const track of eventResult.tracks.split(",")) {
									selectedFeatures.push(`track-${track.trim()}`);
								}

							}

							if (eventResult.event_venue) {

								selectedVenue = allVenues.filter((venue: IDerbyVenue) => venue.id === eventResult.event_venue)[0];

							}

							const eventData = {
								address1: eventResult.venue_address1,
								address2: eventResult.venue_address2,
								city: eventResult.venue_city || "",
								days: eventDays,
								event_description: eventResult.event_description || "",
								event_link: eventResult.event_link || "",
								host: eventResult.event_host || "",
								id: eventResult.event_id,
								name: eventResult.event_name || "",
								selectedVenue,
								venue: eventResult.venue_id || null as number,
							};

							this.setState({
								eventData,
								initialEventData: eventData,
								initialSelectedFeatures: selectedFeatures,
								loading: false,
								selectedFeatures,
								selectedVenue,
							});

						} else {
							// no result, likely bad event ID in URL

							this.setState({
								dataError: true,
								loading: false,
							});

						}

					}).catch((error: AxiosError) => {
						console.error(error);

						this.setState({
							dataError: true,
							loading: false,
						});

					});

				} else {

					this.setState({
						eventData: {
							address1: "",
							address2: "",
							city: "",
							days: [] as IDerbyEventDayFormatted[],
							event_description: "",
							event_link: "",
							host: "",
							name: "",
							venue: null as number,
						},
						loading: false,
					});

				}

		});

	}

}
