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
			countryList: [] as IGeoCountry[],
			dataError: false,
			editingDays: [] as IDerbyEventDayFormatted[],
			eventData: {} as IDerbyEvent,
			focused: true,
			initialEventData: {} as IDerbyEvent,
			initialSelectedFeatures: [] as string[],
			loading: true,
			newDayCounter: -1,
			newVenueAddress1: "",
			newVenueAddress2: "",
			newVenueCity: "",
			newVenueCountry: {} as IGeoCountry,
			newVenueDescription: "",
			newVenueLink: "",
			newVenueName: "",
			newVenuePostcode: "",
			newVenueRegion: {} as IGeoRegion,
			newVenueTimeZone: {} as ITimeZone,
			pageFunction: this.props.match.params.operation === "add" ? "Add New Event" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.eventId
					&& this.props.match.params.eventId.match(/[0-9]+/)
					? "Edit Event" : "Error",
			processing: false,
			regionLists: {} as IGeoRegionList,
			sectionOpenBasic: true,
			sectionOpenDays: true,
			sectionOpenFeatures: true,
			sectionOpenVenue: true,
			selectedFeatures: [] as string[],
			selectedVenue: {} as IDerbyVenue,
			timeZoneList: [],
			venueList: [],
		};

		this.addDay = this.addDay.bind(this);
		this.cancelDayEdit = this.cancelDayEdit.bind(this);
		this.deleteDay = this.deleteDay.bind(this);
		this.editDay = this.editDay.bind(this);
		this.handleCountryChange = this.handleCountryChange.bind(this);
		this.handleFocusChange = this.handleFocusChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleRegionChange = this.handleRegionChange.bind(this);
		this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
		this.handleVenueChange = this.handleVenueChange.bind(this);
		this.isDisabledDate = this.isDisabledDate.bind(this);
		this.onDateChange = this.onDateChange.bind(this);
		this.saveDay = this.saveDay.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
		this.toggleSection = this.toggleSection.bind(this);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {
			this.props.history.push("/");
		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData();
			}

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

						<div>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<React.Fragment>

							<div className="callout">
								<p className="header">IMPORTANT!</p>
								<p>Make sure to click the <strong>SAVE</strong> button at the bottom of the page to save your changes.</p>
							</div>

							<form
								className="entryForm"
								id="accountForm"
								onSubmit={this.submitEventForm}
							>

								<div className="formContainer">

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
												<label htmlFor="link">Web Page <em>(optional)</em></label>
												<input
													id="link"
													name="link"
													data-handler="eventData"
													type="url"
													required={false}
													value={this.state.eventData.link}
													onChange={this.handleInputChange}
												/>
											</div>

											<div className="inputGroup">
												<label htmlFor="description">Description <em>(recommended, but optional)</em></label>
												<textarea
													id="description"
													name="description"
													data-handler="eventData"
													required={false}
													value={this.state.eventData.description}
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

													<div className="inputGroup">
														<label htmlFor="newVenueCountry">Country</label>
														<Select
															id="newVenueCountry"
															name="search-countries"
															className="Select searchSelectCountries"
															classNamePrefix="Select"
															value={this.state.newVenueCountry}
															onChange={this.handleCountryChange}
															options={this.state.countryList}
															getOptionLabel={this.getCountryOptionLabel}
															isSearchable={true}
															isClearable={true}
														/>
													</div>

													{(this.state.newVenueCountry && this.state.regionLists[this.state.newVenueCountry.country_code]) ?
														<div className="inputGroup">
															<label htmlFor="newVenueRegion">{this.state.newVenueCountry.country_region_type}</label>
															<Select
																id="newVenueRegion"
																name="search-countries"
																className="Select searchSelectRegions"
																classNamePrefix="Select"
																value={this.state.newVenueRegion}
																onChange={this.handleRegionChange}
																options={this.state.newVenueCountry
																	&& this.state.newVenueCountry.country_code
																	&& this.state.regionLists[this.state.newVenueCountry.country_code]
																	? this.state.regionLists[this.state.newVenueCountry.country_code]
																	: []}
																getOptionLabel={this.getRegionOptionLabel}
																isSearchable={true}
																isClearable={true}
															/>
														</div>

													: ""}


													<div className="inputGroup">
														<label htmlFor="newVenueTimeZone">Time Zone</label>
														<Select
															id="newVenueTimeZone"
															name="newVenueTimeZone"
															className="Select"
															classNamePrefix="Select"
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
														<label htmlFor="newVenueDescription">Description <em>(optional)</em></label>
														<textarea
															id="newVenueDescription"
															name="newVenueDescription"
															data-handler="newVenue"
															required={false}
															value={this.state.eventData.newVenueDescription}
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
												+ (this.state.editingDays.length ? " ok" : "")}
											data-section="Days"
											onClick={this.toggleSection}
										>
											Event Days ({this.state.editingDays.length})
										</h3>

										<div className={"formSection" + (this.state.sectionOpenDays ? " open" : " closed")}>

											<div className="eventDays">

												{ !this.state.editingDays.length ?
													<p>There are currently no days for this event.  Please add at least one.</p>
												: "" }

												<ul className={"eventDayList" + (this.state.eventData.days.length ? "" : " empty")}>
													{this.state.editingDays
														.sort((day1: IDerbyEventDayFormatted, day2: IDerbyEventDayFormatted) =>
															day1.sortValue > day2.sortValue ? 1 : day1.sortValue < day2.sortValue ? -1 : 0)
														.map((day: IDerbyEventDayFormatted) => (
														<li key={day.id} data-day-id={day.id} className={day.editing ? "editing" : ""}>
															<dl>
																<dt>Date:</dt>
																<dd>{day.dateObject.format("MMM D, Y")}</dd>
																<dt>Start time:</dt>
																<dd>{day.startTime ? moment(day.startTime, "H:mm").format("h:mm a") || "\u00A0" : "(not set)"}</dd>
																<dt>Doors open:</dt>
																<dd>{day.doorsTime ? moment(day.doorsTime, "H:mm").format("h:mm a") || "\u00A0" : "(not set)"}</dd>
																<dt>Description:</dt>
																<dd>{day.description || "\u00A0"}</dd>
															</dl>

															<div className="dayForm">

																<div className="calendarContainer" data-day-id={day.id} id={`date_day_${day.id}`}>
																	{ day.editing ?
																		<DayPickerSingleDateController
																			date={day.dateObject}
																			focused={this.state.focused}
																			hideKeyboardShortcutsPanel={true}
																			numberOfMonths={1}
																			enableOutsideDays={false}
																			initialVisibleMonth={() => day.dateObject}
																			isOutsideRange={(date: moment.Moment) => this.isDisabledDate(date, day.id)}
																			keepOpenOnDateSelect={true}
																			onDateChange={(date: moment.Moment) => this.onDateChange(date, day.id)}
																			onFocusChange={this.handleFocusChange}
																			noBorder={true}
																		/>
																	: "" }
																</div>

																<div className="inputGroup half">
																	<label htmlFor={`startTime_day_${day.id}`}>Start Time</label>
																	<input
																		id={`startTime_day_${day.id}`}
																		name={`startTime_day_${day.id}`}
																		data-handler="eventDay"
																		data-day-id={day.id}
																		type="time"
																		required={true}
																		value={day.startTime}
																		onChange={this.handleInputChange}
																	/>
																</div>

																<div className="inputGroup half">
																	<label htmlFor={`doorsTime_day_${day.id}`}>Doors Open <em>(optional)</em></label>
																	<input
																		id={`doorsTime_day_${day.id}`}
																		name={`doorsTime_day_${day.id}`}
																		data-handler="eventDay"
																		data-day-id={day.id}
																		type="time"
																		required={false}
																		value={day.doorsTime}
																		onChange={this.handleInputChange}
																	/>
																</div>

																<div className="inputGroup">
																	<label htmlFor={`description_day_${day.id}`}>Description <em>(optional)</em></label>
																	<textarea
																		id={`description_day_${day.id}`}
																		name={`description_day_${day.id}`}
																		data-handler="eventDay"
																		data-day-id={day.id}
																		required={false}
																		value={day.description}
																		onChange={this.handleInputChange}
																	/>
																</div>

															</div>

															<div className="buttonRow operationButtons">
																<button
																	className="smallButton"
																	onClick={this.editDay}
																	data-day-id={day.id}
																>
																	Edit
																</button>
																<button
																	className="smallButton"
																	onClick={this.deleteDay}
																	data-day-id={day.id}
																>
																	Delete
																</button>
															</div>

															<div className="buttonRow editingButtons">
																<button
																	className="smallButton"
																	disabled={!(day.date && day.startTime && day.dateObject.isValid())}
																	onClick={this.saveDay}
																	data-day-id={day.id}
																>
																	Done
																</button>
																<button className="smallButton" onClick={this.cancelDayEdit} data-day-id={day.id}>Cancel</button>
															</div>
														</li>
													))}
												</ul>

												<div className="buttonRow">
													<button className="smallButton" onClick={this.addDay}>Add day</button>
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

								</div>

								<div className="buttonRow">
									<button
										type="submit"
										disabled={
											!this.state.eventData.host
											|| (!this.state.eventData.venue
												&& (!this.state.newVenueName
													|| !this.state.newVenueAddress1
													|| !this.state.newVenueCity
													|| !this.state.newVenueTimeZone.timezone_id)
												)
											|| !this.state.editingDays.length
											|| (!this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "derbytype").length
												&& !this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "track").length
												)
										}
										className="largeButton"
									>
										Save Event
									</button>
								</div>

							</form>

						</React.Fragment>

					}

				</div>
			</div>
		);

	}

	addDay(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		const editingDays = this.state.editingDays;
		let nextDate = moment();


		if (editingDays.length) {

			nextDate = moment(editingDays.map((day: IDerbyEventDayFormatted) => day.dateObject)
				.sort((day1: moment.Moment, day2: moment.Moment) =>
					day1.isBefore(day2) ? 1 : day1.isAfter(day2) ? -1 : 0)[0]
				.format("Y-MM-DD"))
				.add(1, "days");

		}

		editingDays.push({
			date: nextDate.format("MMM D, Y"),
			dateObject: nextDate,
			description: "",
			doorsTime: "",
			editing: true,
			id: this.state.newDayCounter,
			sortValue: nextDate.format("Y-MM-DD"),
			startTime: "",
		});

		this.setState({
			editingDays,
			newDayCounter: this.state.newDayCounter - 1,
		});

	}

	cancelDayEdit(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		const id = Number(event.currentTarget.getAttribute("data-day-id"));
		const editingDays = this.state.editingDays;
		const days = editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		if (id > 0) {
			const originalDay: IDerbyEventDayFormatted = this.state.eventData.days.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];

			days.push({
				dateObject: moment(originalDay.dateObject),
				...originalDay,
			});
		}

		this.setState({
			editingDays: days,
		});

	}

	deleteDay(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		const id = Number(event.currentTarget.getAttribute("data-day-id"));

		const editingDays = this.state.editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		this.setState({
			editingDays,
		});

	}

	editDay(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		const id = Number(event.currentTarget.getAttribute("data-day-id"));

		const editingDays = this.state.editingDays;
		const thisDay = editingDays.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];
		const days = editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		thisDay.editing = true;

		days.push(thisDay);

		this.setState({
			editingDays: days,
		});

	}

	getCountryOptionLabel(option: IGeoCountry) {

		return option.country_name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion) {

		return option.region_name || "(type here to search list)";

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

	handleCountryChange(country: IGeoCountry) {

		this.setState({
			newVenueCountry: Object.assign({disabled: true}, country) || {} as IGeoCountry,
			newVenueRegion: {} as IGeoRegion,
		});

	}

	handleRegionChange(region: IGeoRegion) {

		this.setState({
			newVenueRegion: region || {} as IGeoRegion,
		});

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

				const id = Number(event.currentTarget.getAttribute("data-day-id"));
				const field = event.currentTarget.getAttribute("id").split("_")[0];

				const editingDays = this.state.editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);
				const thisDay = this.state.editingDays.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];

				thisDay[field] = event.currentTarget.value;

				editingDays.push(thisDay);

				this.setState({
					editingDays,
				});

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

	isDisabledDate(date: moment.Moment, id: number) {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const compareDate = date.hours(0).minute(0).seconds(0);

		if (compareDate < todaysDate) {
			return true;
		}

		const usedDates = this.state.editingDays
			.filter((day: IDerbyEventDayFormatted) => day.id !== id)
			.map((usedDay: IDerbyEventDayFormatted) =>
			usedDay.dateObject.format("Y-MM-DD"));

		return usedDates.indexOf(compareDate.format("Y-MM-DD")) > -1;
	}

	onDateChange(date: moment.Moment, id: number) {

		const editingDays = this.state.editingDays;
		const thisDay = editingDays.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];
		const days = editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		thisDay.dateObject = date;
		thisDay.date = date.format("MMM D, Y");

		days.push(thisDay);

		this.setState({
			editingDays: days,
		});

	}

	saveDay(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		const id = Number(event.currentTarget.getAttribute("data-day-id"));
		const eventData = this.state.eventData;
		const editedDay = this.state.editingDays.filter((day: IDerbyEventDayFormatted) => day.id === id)[0];
		const editingDays = this.state.editingDays.filter((day: IDerbyEventDayFormatted) => day.id !== id);
		const days = eventData.days.filter((day: IDerbyEventDayFormatted) => day.id !== id);

		const newDate = moment(editedDay.date, "MMM D, Y");

		days.push({
			...editedDay,
			dateObject: newDate,
			editing: false,
			sortValue: newDate.format("Y-MM-DD"),
		});
		eventData.days = days;

		editingDays.push({
			...editedDay,
			dateObject: newDate,
			editing: false,
			sortValue: newDate.format("Y-MM-DD"),
		});

		this.setState({
			editingDays,
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
		let initialSelectedVenue = {} as IDerbyVenue;
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

							const eventDays = eventResult.days.map((day) => ({
									date: moment.utc(day.eventday_start_venue).format("MMM D, Y"),
									dateObject: moment.utc(day.eventday_start_venue),
									description: day.eventday_description,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("HH:mm")
										: "",
									editing: false,
									id: day.eventday_id,
									sortValue: moment.utc(day.eventday_start_venue).format("Y-MM-DD"),
									startTime: moment.utc(day.eventday_start_venue).format("HH:mm"),
								}));

							const initialEventDays = eventResult.days.map((day) => ({
									date: moment.utc(day.eventday_start_venue).format("MMM D, Y"),
									dateObject: moment.utc(day.eventday_start_venue),
									description: day.eventday_description,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("HH:mm")
										: "",
									editing: false,
									id: day.eventday_id,
									sortValue: moment.utc(day.eventday_start_venue).format("Y-MM-DD"),
									startTime: moment.utc(day.eventday_start_venue).format("HH:mm"),
								}));

							const editingDays = eventResult.days.map((day) => ({
									date: moment.utc(day.eventday_start_venue).format("MMM D, Y"),
									dateObject: moment.utc(day.eventday_start_venue),
									description: day.eventday_description,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("HH:mm")
										: "",
									editing: false,
									id: day.eventday_id,
									sortValue: moment.utc(day.eventday_start_venue).format("Y-MM-DD"),
									startTime: moment.utc(day.eventday_start_venue).format("HH:mm"),
								}));


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
								initialSelectedVenue = allVenues.filter((venue: IDerbyVenue) => venue.id === eventResult.event_venue)[0];

							}

							const eventData = {
								address1: eventResult.venue_address1,
								address2: eventResult.venue_address2,
								city: eventResult.venue_city || "",
								days: eventDays,
								description: eventResult.event_description || "",
								host: eventResult.event_host || "",
								id: eventResult.event_id,
								link: eventResult.event_link || "",
								name: eventResult.event_name || "",
								selectedVenue,
								venue: eventResult.venue_id || null as number,
							};

							const initialEventData = {
								address1: eventResult.venue_address1,
								address2: eventResult.venue_address2,
								city: eventResult.venue_city || "",
								days: initialEventDays,
								description: eventResult.event_description || "",
								host: eventResult.event_host || "",
								id: eventResult.event_id,
								link: eventResult.event_link || "",
								name: eventResult.event_name || "",
								selectedVenue: initialSelectedVenue,
								venue: eventResult.venue_id || null as number,
							};

							this.setState({
								editingDays,
								eventData,
								initialEventData,
								initialSelectedFeatures: JSON.parse(JSON.stringify(selectedFeatures)),
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
						editingDays: [],
						eventData: {
							address1: "",
							address2: "",
							city: "",
							days: [] as IDerbyEventDayFormatted[],
							description: "",
							host: "",
							link: "",
							name: "",
							venue: null as number,
						},
						loading: false,
					});

				}

		});

	}

}
