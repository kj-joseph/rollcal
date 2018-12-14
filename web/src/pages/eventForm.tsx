import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IDerbyEvent, IDerbyEventChangeObject, IDerbyEventDay } from "interfaces/event";
import { IDerbyFeature } from "interfaces/feature";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IDerbyVenue, INewDerbyVenue } from "interfaces/venue";

import { saveEventChange } from "services/eventChangeService";
import { mapDayForStorage, mapDaysForEditing } from "services/eventDayService";
import { getEventDetails } from "services/eventService";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes } from "services/featureService";
import { getGeography } from "services/geoService";
import { getTimeZones } from "services/timeService";
import { checkUserRole } from "services/userService";
import { buildVenueLocation, loadVenues } from "services/venueService";

import "react-dates/initialize";

import moment from "moment";

import Select from "react-select";

import AddressFields from "components/addressFields";
import Callout from "components/callout";
import EventDayPicker from "components/eventDayPicker";
import FeatureIconSet from "components/featureIconSet";
import FormSection from "components/formSection";

interface IEventFormState {
	countryList: IGeoCountry[];
	dataError: boolean;
	editingDays: IDerbyEventDay[];
	eventData: IDerbyEvent;
	eventFeatures: {
		derbytypes: IDerbyFeature[];
		sanctions: IDerbyFeature[];
		tracks: IDerbyFeature[];
	};
	focused: boolean;
	initialEventData: IDerbyEvent;
	initialSelectedFeatures: string[];
	loading: boolean;
	newDayCounter: number;
	newVenueAddress1: string;
	newVenueAddress2: string;
	newVenueCity: string;
	newVenueCountry: IGeoCountry;
	newVenueDescription: string;
	newVenueLink: string;
	newVenueName: string;
	newVenuePostcode: string;
	newVenueRegion: IGeoRegion;
	newVenueTimeZone: ITimeZone;
	pageFunction: string;
	path: string;
	processing: boolean;
	sectionOpenBasic: boolean;
	sectionOpenDays: boolean;
	sectionOpenFeatures: boolean;
	sectionOpenVenue: boolean;
	selectedFeatures: string[];
	submitError: string;
	submitSuccess: boolean;
	timeZoneList: ITimeZone[];
	userId: number;
	venueList: IDerbyVenue[];
}

export default class EventForm<Props> extends RCComponent<IProps> {

	state: IEventFormState = {
		countryList: [],
		dataError: false,
		editingDays: [],
		eventData: {} as IDerbyEvent,
		eventFeatures: {
			derbytypes: [],
			sanctions: [],
			tracks: [],
		},
		focused: true,
		initialEventData: {} as IDerbyEvent,
		initialSelectedFeatures: [],
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
		path: null,
		processing: false,
		sectionOpenBasic: true,
		sectionOpenDays: true,
		sectionOpenFeatures: true,
		sectionOpenVenue: true,
		selectedFeatures: [],
		submitError: null,
		submitSuccess: false,
		timeZoneList: [],
		userId: null,
		venueList: [],
	};

	constructor(props: IProps) {
		super(props);

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
		this.submitEventForm = this.submitEventForm.bind(this);
		this.toggleFeatureIcon = this.toggleFeatureIcon.bind(this);
		this.toggleSection = this.toggleSection.bind(this);
	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId && this.state.pageFunction !== "Error") {

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
			detail: this.props.match.params.operation === "add" ? "Add New Event" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.eventId
					&& this.props.match.params.eventId.match(/[0-9]+/)
					? "Edit Event" : "",
			page: "User Dashboard",
		});

	}

	render() {

		return (
			<div className="eventForm">

				<p className="backToLink">
					<Link to="/dashboard/events">
						&laquo; Back to your events
					</Link>
				</p>

				<div>

					<h1>{this.state.pageFunction}</h1>

					{this.state.loading || this.state.processing ?

						<div className="loader" />

					: this.state.submitSuccess ?

						( this.state.eventData.id ?

							<>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your changes to this event have been submitted.  Once one of our crack staff reviews your changes, we'll let you know.  Thanks for your help!</p>
							</>

						:

							<>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your new event has been submitted.  Once one of our crack staff reviews it, we'll let you know.  Thanks for your help!</p>
							</>

						)

					: this.state.dataError ?

						<div>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<>

							<Callout title="Important!">
								<p>Make sure to click the <strong>Submit Changes</strong> button at the bottom of the page to save your changes.</p>
							</Callout>

							<form
								className="entryForm"
								id="eventForm"
								onSubmit={this.submitEventForm}
							>

								<div className="formContainer">

									<FormSection
										checked={!!this.state.eventData.host}
										status={this.state.sectionOpenBasic}
										name="Basic"
										label="Basic Event Information"
										toggle={this.toggleSection}
									>

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

									</FormSection>

									<FormSection
										checked={!!this.state.eventData.venue
											|| (!!this.state.newVenueName
												&& !!this.state.newVenueAddress1
												&& !!this.state.newVenueCity
												&& !!this.state.newVenueCountry.code
												&& !!this.state.newVenueTimeZone.id)}
										status={this.state.sectionOpenVenue}
										name="Venue"
										label="Venue"
										toggle={this.toggleSection}
									>

										<div className="inputGroup">
											<Select
												className="Select"
												classNamePrefix="Select"
												name="venue"
												value={this.state.eventData.venue}
												onChange={this.handleVenueChange}
												options={this.state.venueList}
												getOptionLabel={this.getVenueLabel}
												isSearchable={true}
												isClearable={true}
											/>
										</div>

										{this.state.eventData.venue.id === 0 ?

											<>

												<div className="inputGroup">
													<label htmlFor="newVenueName">Name</label>
													<input
														id="newVenueName"
														name="newVenueName"
														data-handler="newVenue"
														data-statevar="newVenueName"
														type="text"
														required={true}
														value={this.state.newVenueName}
														onChange={this.handleInputChange}
													/>
												</div>

												<AddressFields
													prefix="address"
													address1={({
														handler: this.handleInputChange,
														stateVar: "newVenueAddress1",
														value: this.state.newVenueAddress1,
													})}
													address2={({
														handler: this.handleInputChange,
														stateVar: "newVenueAddress2",
														value: this.state.newVenueAddress2,
													})}
													city={({
														handler: this.handleInputChange,
														stateVar: "newVenueCity",
														value: this.state.newVenueCity,
													})}
													country={({
														handler: this.handleCountryChange,
														label: this.getCountryOptionLabel,
														list: this.state.countryList,
														value: this.state.newVenueCountry,
													})}
													region={({
														handler: this.handleRegionChange,
														label: this.getRegionOptionLabel,
														value: this.state.newVenueRegion,
													})}
													postcode={({
														handler: this.handleInputChange,
														stateVar: "newVenuePostcode",
														value: this.state.newVenuePostcode,
													})}
												/>

												<div className="inputGroup selectTimeZone">
													<label htmlFor="timezone">Time Zone</label>
													<Select
														id="timezone"
														name="timezone"
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
													<label htmlFor="link">Website <em>(optional)</em></label>
													<input
														id="link"
														name="link"
														data-handler="newVenue"
														data-statevar="link"
														type="url"
														required={false}
														value={this.state.newVenueLink}
														onChange={this.handleInputChange}
													/>
												</div>

												<div className="inputGroup">
													<label htmlFor="newVenueDescription">Description <em>(optional)</em></label>
													<textarea
														id="newVenueDescription"
														name="newVenueDescription"
														data-handler="newVenue"
														data-statevar="newVenueDescription"
														required={false}
														value={this.state.newVenueDescription}
														onChange={this.handleInputChange}
													/>
												</div>

											</>

										: null}

									</FormSection>

									<FormSection
										checked={!!this.state.editingDays
											.filter((day: IDerbyEventDay) =>
												day.id > 0 || day.editing === false).length}
										count={this.state.editingDays
											.filter((day: IDerbyEventDay) =>
												day.id > 0 || day.editing === false).length}
										status={this.state.sectionOpenDays}
										name="Days"
										label="Event Days"
										toggle={this.toggleSection}
									>

										<div className="eventDays">

											{ !this.state.editingDays.length ?
												<p>There are currently no days for this event.  Please add at least one.</p>
											: null}

											<ul className={"eventDayList" + (this.state.editingDays.length ? "" : " empty")}>
												{this.state.editingDays
													.sort((day1: IDerbyEventDay, day2: IDerbyEventDay) =>
														day1.sortValue > day2.sortValue ? 1 : day1.sortValue < day2.sortValue ? -1 : 0)
													.map((day: IDerbyEventDay) => (
													<li key={day.id} data-day_id={day.id} className={day.editing ? "editing" : ""}>
														<dl>
															<dt>Date:</dt>
															<dd>{day.dateObject.format("MMM D, Y")}</dd>
															<dt>Start time:</dt>
															<dd>{day.startTime ? moment(day.startTime, "H:mm").format("h:mm a") : "(not set)"}</dd>
															<dt>Doors open:</dt>
															<dd>{day.doorsTime ? moment(day.doorsTime, "H:mm").format("h:mm a") : "(not set)"}</dd>
															<dt>Description:</dt>
															<dd>{day.description || "(none)"}</dd>
														</dl>

														<div className="dayForm">

															<div
																className="calendarContainer"
																data-day_id={day.id}
																id={`date_day_${day.id}`}
															>
																{ day.editing ?

																	<EventDayPicker
																		day={day}
																		focused={this.state.focused}
																		isOutsideRange={this.isDisabledDate}
																		onDateChange={this.onDateChange}
																		onFocusChange={this.handleFocusChange}
																	/>

																: null}

															</div>

															<div className="inputGroup half">
																<label htmlFor={`startTime_day_${day.id}`}>Start Time</label>
																<input
																	id={`startTime_day_${day.id}`}
																	name={`startTime_day_${day.id}`}
																	data-handler="eventDay"
																	data-day_id={day.id}
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
																	data-day_id={day.id}
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
																	data-day_id={day.id}
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
																data-day_id={day.id}
															>
																Edit
															</button>
															<button
																className="smallButton"
																onClick={this.deleteDay}
																data-day_id={day.id}
															>
																Delete
															</button>
														</div>

														<div className="buttonRow editingButtons">
															<button
																className="smallButton"
																disabled={!(day.date && day.startTime && day.dateObject.isValid())}
																onClick={this.saveDay}
																data-day_id={day.id}
															>
																Done
															</button>
															<button className="smallButton" onClick={this.cancelDayEdit} data-day_id={day.id}>Cancel</button>
														</div>
													</li>
												))}
											</ul>

											<div className="buttonRow">
												<button className="smallButton" onClick={this.addDay}>Add day</button>
											</div>

										</div>

									</FormSection>

									<FormSection
										checked={!!(
											this.state.selectedFeatures
											.filter((feature: string) =>
												feature.split("-")[0] === "derbytype").length
											+ this.state.selectedFeatures
											.filter((feature: string) =>
												feature.split("-")[0] === "track").length
											)}
										count={this.state.selectedFeatures.length}
										status={this.state.sectionOpenFeatures}
										name="Features"
										label="Event Features"
										toggle={this.toggleSection}
									>

										<FeatureIconSet
											data={[
												{
													items: this.state.eventFeatures.tracks,
													label: "Tracks (at least one)",
													type: "track",
												},
												{
													items: this.state.eventFeatures.derbytypes,
													label: "Derby Types (at least one)",
													type: "derbytype",
												},
												{
													items: this.state.eventFeatures.sanctions,
													label: "Sanctions (optional)",
													type: "sanction",
												},
											]}
											selected={this.state.selectedFeatures}
											toggle={this.toggleFeatureIcon}
										/>

									</FormSection>

								</div>

								<div className="buttonRow">

									{ this.state.submitError ?
										<p className="error">{this.state.submitError}</p>
									: null}

									<button
										type="submit"
										disabled={
											!this.state.eventData.host
											|| (!this.state.eventData.venue
												&& (!this.state.newVenueName
													|| !this.state.newVenueAddress1
													|| !this.state.newVenueCity
													|| !this.state.newVenueCountry.code
													|| !this.state.newVenueTimeZone.id)
												)
											|| !this.state.editingDays.length
											|| (!this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "derbytype").length
												|| !this.state.selectedFeatures.filter((feature: string) => feature.split("-")[0] === "track").length
												)
											|| !!this.state.editingDays.filter((day: IDerbyEventDay) => day.editing).length
										}
										className="largeButton"
									>
										Submit Changes
									</button>
								</div>

							</form>

						</>

					}

				</div>
			</div>
		);

	}

	addDay(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		const editingDays = this.state.editingDays;
		let nextDate = moment();

		if (editingDays.length) {

			nextDate = moment(editingDays
				.map((day: IDerbyEventDay) =>
					day.dateObject)
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

		const newCounter = this.state.newDayCounter - 1;

		this.setState({
			editingDays,
			newDayCounter: newCounter,
		});

	}

	cancelDayEdit(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		const id = Number(event.currentTarget.dataset.day_id);
		const editingDays = this.state.editingDays;
		const days = editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id);

		if (id > 0) {

			const originalDay: IDerbyEventDay = mapDaysForEditing(
				this.state.eventData.days
					.filter((day: IDerbyEventDay) =>
						day.id === id))[0];

			days.push(originalDay);

		}

		this.setState({
			editingDays: days,
		});

	}

	deleteDay(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		const id = Number(event.currentTarget.dataset.day_id);
		const eventData = this.state.eventData;

		const eventDays = eventData.days
			.filter((day: IDerbyEventDay) =>
				day.id !== id);
		const editingDays = this.state.editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id);

		eventData.days = eventDays;

		this.setState({
			editingDays,
			eventData,
		});

	}

	editDay(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		const id = Number(event.currentTarget.dataset.day_id);

		const editingDays = this.state.editingDays;
		const thisDay = editingDays
			.filter((day: IDerbyEventDay) =>
				day.id === id)[0];
		const days = editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id);

		thisDay.editing = true;

		days.push(thisDay);

		this.setState({
			editingDays: days,
		});

	}

	getCountryOptionLabel(option: IGeoCountry): string {

		return option.name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion): string {

		return option.name || "(type here to search list)";

	}

	getTimeZoneLabel(timezone: ITimeZone): string {

		if (timezone && timezone.name) {
			return timezone.name;
		} else {
			return "(Type here to search time zones)";
		}

	}

	getVenueLabel(venue: IDerbyVenue): string {

		return venue && venue.name ?
			!venue.country || !venue.country.code ?
				`${venue.name} - ${venue.city}`
			: buildVenueLocation(venue)
		: "(Type here to search venues)";

	}

	handleCountryChange(country: IGeoCountry): void {

		this.setState({
			newVenueCountry: country || {} as IGeoCountry,
			newVenueRegion: {} as IGeoRegion,
		});

	}

	handleRegionChange(region: IGeoRegion): void {

		this.setState({
			newVenueRegion: region || {} as IGeoRegion,
		});

	}

	handleFocusChange({ focused }: { focused: boolean }): void {

		this.setState({
			focused,
		});

	}

	handleInputChange <T extends keyof IEventFormState>(event: React.ChangeEvent<any>): void {

		switch (event.currentTarget.dataset.handler) {

			case "eventData":

				const eventData = this.state.eventData;
				const inputField: (keyof IDerbyEvent) = event.currentTarget.name;

				eventData[inputField] = event.currentTarget.value;

				this.setState({
					eventData,
				});

				break;

			case "eventDay":

				const id = Number(event.currentTarget.dataset.day_id);
				const dayField: (keyof IDerbyEventDay) = event.currentTarget.getAttribute("id").split("_")[0];

				const editingDays = this.state.editingDays.filter((day: IDerbyEventDay) => day.id !== id);
				const thisDay = this.state.editingDays.filter((day: IDerbyEventDay) => day.id === id)[0];

				thisDay[dayField] = event.currentTarget.value;

				editingDays.push(thisDay);

				this.setState({
					editingDays,
				});

				break;

			default: // new venue data

				const fieldName: (keyof IEventFormState) =
					event.currentTarget.dataset.statevar ?
						event.currentTarget.dataset.statevar as keyof IEventFormState
					: event.currentTarget.name as keyof IEventFormState;

				const newState = {
					[fieldName]: event.currentTarget.value,
				};

				this.setState(newState as { [P in T]: IEventFormState[P]; });

		}

	}

	handleTimeZoneChange(timezone: ITimeZone): void {

		this.setState({
			newVenueTimeZone: timezone || {} as ITimeZone,
		});

	}

	handleVenueChange(venue: IDerbyVenue): void {

		const eventData = this.state.eventData;

		eventData.venue = venue || {} as IDerbyVenue;

		this.setState({
			eventData,
		});

	}

	isDisabledDate(date: moment.Moment, id: number): boolean {

		const todaysDate = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
		const compareDate = date.hours(0).minute(0).seconds(0);

		if (compareDate < todaysDate) {
			return true;
		}

		const usedDates = this.state.editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id)
			.map((usedDay: IDerbyEventDay) =>
				usedDay.dateObject.format("Y-MM-DD"));

		return usedDates.indexOf(compareDate.format("Y-MM-DD")) > -1;
	}

	onDateChange(date: moment.Moment, id: number): void {

		const editingDays = this.state.editingDays;
		const thisDay = editingDays
			.filter((day: IDerbyEventDay) =>
				day.id === id)[0];
		const days = editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id);

		thisDay.dateObject = date;
		thisDay.date = date.format("MMM D, Y");

		days.push(thisDay);

		this.setState({
			editingDays: days,
		});

	}

	saveDay(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		const id = Number(event.currentTarget.dataset.day_id);
		const eventData = this.state.eventData;
		const editedDay = this.state.editingDays
			.filter((day: IDerbyEventDay) =>
				day.id === id)[0];
		const editingDays = this.state.editingDays
			.filter((day: IDerbyEventDay) =>
				day.id !== id);
		const days = eventData.days
			.filter((day: IDerbyEventDay) =>
				day.id !== id);

		const newDate = moment(editedDay.date, "MMM D, Y");

		days.push(mapDayForStorage(editedDay));
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

	toggleSection <T extends keyof IEventFormState>(event: React.MouseEvent<HTMLHeadingElement>): void {

		event.preventDefault();

		const sectionToggle: (keyof IEventFormState) = `sectionOpen${event.currentTarget.dataset.section}` as (keyof IEventFormState);

		const currentState = this.state[sectionToggle];

		const newState = {
			[sectionToggle]: !currentState,
		};

		this.setState(newState as { [P in T]: IEventFormState[P]; });

	}

	loadData(): void {

		const dataPromises: Array<Promise<any>> = [
			getGeography(),
			getDerbySanctions(),
			getDerbyTracks(),
			getDerbyTypes(),
			getTimeZones(),
			loadVenues(),
		];

		const isEdit = !!this.props.match.params.eventId;

		if (isEdit) {
			dataPromises.push(getEventDetails(this.props.match.params.eventId));
		}

		const loadData = this.addPromise(
			Promise.all(dataPromises));

		loadData
			.then((data: [
				IGeoCountry[],
				IDerbyFeature[],
				IDerbyFeature[],
				IDerbyFeature[],
				ITimeZone[],
				IDerbyVenue[],
				IDerbyEvent
			]) => {

				const [
					countryList,
					derbySanctions,
					derbyTracks,
					derbyTypes,
					timeZoneList,
					venueList,
					eventData,
				] = data;

				venueList.unshift({
					city: "fill form below)",
					id: 0,
					name: "(Add new venue",
				} as IDerbyVenue);

				let initialEventData: IDerbyEvent = {
					days: [] as IDerbyEventDay[],
					description: "",
					host: "",
					id: 0,
					link: "",
					name: "",
					venue: {} as IDerbyVenue,
				};

				let selectedFeatures: string[] = [];

				if (isEdit) {

					initialEventData = {
						days: eventData.days,
						description: eventData.description || "",
						host: eventData.host || "",
						id: eventData.id,
						link: eventData.link || "",
						name: eventData.name || "",
						venue: venueList.filter((venue) =>
							venue.id === eventData.venue.id)[0],
					};

					if (eventData.features.derbytypes && eventData.features.derbytypes.length) {
						selectedFeatures = selectedFeatures.concat(eventData.features.derbytypes
							.map((derbytype) =>
								`derbytype-${derbytype.id}`));
					}

					if (eventData.features.sanctions && eventData.features.sanctions.length) {
						selectedFeatures = selectedFeatures.concat(eventData.features.sanctions
							.map((sanction) =>
								`sanction-${sanction.id}`));
					}

					if (eventData.features.tracks && eventData.features.tracks.length) {
						selectedFeatures = selectedFeatures.concat(eventData.features.tracks
							.map((track) =>
								`track-${track.id}`));
					}

				}

				this.setState({
					countryList,
					editingDays: isEdit ?
						mapDaysForEditing(eventData.days)
						: [],
					eventData: Object.assign({}, initialEventData),
					eventFeatures: {
						derbytypes: derbyTypes,
						sanctions: derbySanctions,
						tracks: derbyTracks,
					},
					initialEventData: Object.assign({}, initialEventData),
					initialSelectedFeatures: ([]).concat(selectedFeatures),
					loading: false,
					selectedFeatures: ([]).concat(selectedFeatures),
					timeZoneList,
					venueList,
				});

			})
			.catch((error) => {
				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(loadData.clear);

	}

	submitEventForm(event: React.MouseEvent<HTMLFormElement>): void {

		event.preventDefault();

		this.setState({
			processing: true,
		});

		const dataChanges: IDerbyEventChangeObject = {
			data: [],
			days: [],
			features: {
				add: [],
				delete: [],
			},
		};

		const checkDataChange = (field: keyof IDerbyEvent) => {

			const initialValue = this.state.initialEventData[field] || null;
			const value = this.state.eventData[field] || null;

			if ((!this.state.eventData.id && value)
				|| (this.state.eventData.id && value !== initialValue)) {
				dataChanges.data.push({
					field,
					value,
				});
			}

		};

		checkDataChange("description");
		checkDataChange("host");
		checkDataChange("link");
		checkDataChange("name");

		if (this.state.eventData.venue && this.state.eventData.venue.id) {

			if (this.state.eventData.venue.id !== this.state.initialEventData.venue.id) {

				dataChanges.data.push({
					field: "venue",
					value: this.state.eventData.venue.id,
				});

			}

		} else {

			dataChanges.newVenueData = {
				address1: this.state.newVenueAddress1 || null,
				address2: this.state.newVenueAddress2 || null,
				city: this.state.newVenueCity || null,
				country: this.state.newVenueCountry.code,
				description: this.state.newVenueDescription || null,
				link: this.state.newVenueLink || null,
				name: this.state.newVenueName || null,
				postcode: this.state.newVenuePostcode || null,
				region: this.state.newVenueRegion.id || null,
				timezone: this.state.newVenueTimeZone.id,
			};

			Object.keys(dataChanges.newVenueData)
				.forEach((key: keyof INewDerbyVenue) => {
					if (dataChanges.newVenueData[key] === undefined) {
						delete dataChanges.newVenueData[key];
					}
				});

		}

		for (const feature of this.state.selectedFeatures) {

			if (this.state.initialSelectedFeatures.indexOf(feature) === -1) {
				dataChanges.features.add.push(feature);
			}

		}

		for (const feature of this.state.initialSelectedFeatures) {

			if (this.state.selectedFeatures.indexOf(feature) === -1) {
				dataChanges.features.delete.push(feature);
			}

		}

		const validDays = this.state.eventData.days
			.filter((day: IDerbyEventDay) =>
				day.date && day.dateObject.isValid() && day.startTime);

		const dayIds = this.state.eventData.days
			.map((day: IDerbyEventDay) =>
				day.id);

		dataChanges.days = dataChanges.days.concat(
			validDays
				.filter((day: IDerbyEventDay) =>
					day.id < 0 )
				.map((day: IDerbyEventDay) => ({
					id: null as number,
					operation: "add",
					value: {
						datetime: `${day.dateObject.format("Y-MM-DD")} ${
								moment(day.startTime, "h:mm a").format("hh:mm:00")
							}`,
						description: day.description,
						doors: `${day.dateObject.format("Y-MM-DD")} ${
								moment(day.doorsTime, "h:mm a").format("hh:mm:00")
							}`,
					},
				})));

		if (this.state.eventData.id) {

			dataChanges.days = dataChanges.days.concat(
				this.state.initialEventData.days
					.filter((day: IDerbyEventDay) =>
						dayIds.indexOf(day.id) === -1 )
					.map((day: IDerbyEventDay) => ({
						id: day.id,
						operation: "delete",
						value: {},
					})));

			for (const editedDay of validDays
					.filter((day: IDerbyEventDay) =>
						day.id > 0 )) {

				const initialDay = this.state.initialEventData.days
					.filter((day: IDerbyEventDay) =>
						day.id === editedDay.id )[0];

				if (editedDay.date !== initialDay.date
					|| editedDay.startTime !== initialDay.startTime
					|| editedDay.doorsTime !== initialDay.doorsTime
					|| editedDay.description !== initialDay.description) {

					const edits: {
						datetime?: string,
						description?: string,
						doors?: string,
					} = {};

					if (editedDay.date !== initialDay.date
						|| editedDay.startTime !== initialDay.startTime) {
						edits.datetime = `${editedDay.dateObject.format("Y-MM-DD")} ${editedDay.startTime}:00`;
					}

					if (editedDay.description !== initialDay.description) {
						edits.description = editedDay.description || null;
					}

					if (editedDay.doorsTime !== initialDay.doorsTime) {
						if (editedDay.doorsTime) {
							edits.doors = `${editedDay.dateObject.format("Y-MM-DD")} ${editedDay.doorsTime}:00`;
						} else {
							edits.doors = null;
						}
					}

					dataChanges.days.push({
						id: editedDay.id,
						operation: "change",
						value: edits,
					});

				}

			}

		}

		if (dataChanges.data.length
			|| dataChanges.days.length
			|| dataChanges.features.add.length
			|| dataChanges.features.delete.length
			|| dataChanges.newVenueData) {

			const saveChange = this.addPromise(
				saveEventChange(dataChanges, this.state.eventData.id));

			saveChange
				.then((result) => {

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
