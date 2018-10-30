import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyEvent, IDerbyEvent, IDerbyEventDayFormatted,
	IDerbySanction, IDerbyTrack, IDerbyType,
	IGeoCountry, IGeoData, IGeoRegionList,
	} from "components/interfaces";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography } from "components/lib/data";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import Select from "react-select";

import FeatureIcon from "components/partials/featureIcon";

export default class EventForm<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			dataError: false,
			eventData: {} as IDerbyEvent,
			loading: true,
			newDayDate: "",
			newDayDescription: "",
			newDayDoors: "",
			newDayTime: "",
			pageFunction: this.props.match.params.operation === "add" ? "Add New Event" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.eventId
					&& this.props.match.params.eventId.match(/[0-9]+/)
					? "Edit Event" : "Error",
			processing: false,
			sectionOpenBasic: true,
			sectionOpenDays: true,
			sectionOpenFeatures: true,
			sectionOpenVenue: true,
			selectedFeatures: [] as string[],
		};

		this.handleInputChange = this.handleInputChange.bind(this);
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
										+ (this.state.eventData.venue ? " ok" : "")}
									data-section="Venue"
									onClick={this.toggleSection}
								>
									Venue
								</h3>

								<div className={"formSection" + (this.state.sectionOpenVenue ? " open" : " closed")}>

									<p>Test</p>

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

									<div className="eventDays">
										<dl>
											{this.state.eventData.days.map((day: IDerbyEventDayFormatted) => (
												<React.Fragment key={day.date}>
													<dt><strong>{day.date}:</strong>{day.startTime}
														{day.doorsTime ? ` (Doors: ${day.doorsTime})` : ""}
													</dt>
													<dd>{day.description}</dd>
												</React.Fragment>
											))}
										</dl>
									</div>

									<div className="inputGroup short">
										<label htmlFor="newDayTime">Start Time</label>
										<input
											id="newDayTime"
											name="newDayTime"
											data-handler="newDay"
											type="time"
											required={false}
											value={this.state.newDayTime}
											onChange={this.handleInputChange}
										/>
									</div>

									<p>{this.state.newDayTime}</p>

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

	loadData() {

		let countryList: IGeoCountry[] = [];
		let eventSanctions: IDerbySanction[] = [];
		let eventTracks: IDerbyTrack[] = [];
		let eventTypes: IDerbyType[] = [];
		const promises: Array<Promise<any>> = [];
		let regionLists: IGeoRegionList = {};

		promises.push(getGeography(this.props)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
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

			if (this.props.match.params.eventId) {

				axios.get(`${this.props.apiLocation}events/getEventDetails/${this.props.match.params.eventId}`, { withCredentials: true })
					.then((result: AxiosResponse) => {

						if (result.data && result.data.user_id === this.props.loggedInUserId) {

							const eventResult: IDBDerbyEvent = result.data;

							const eventDays = [] as IDerbyEventDayFormatted[];
							for (const day of eventResult.days) {
								eventDays.push({
									date: moment.utc(day.eventday_start_venue).format("MMM D"),
									description: day.eventday_description,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("h:mm a")
										: "",
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
								venue: eventResult.venue_id || "",
							};

							this.setState({
								eventData,
								initialEventData: eventData,
								initialSelectedFeatures: selectedFeatures,
								loading: false,
								selectedFeatures,
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

	handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {

		console.log(event.currentTarget.getAttribute("data-handler"));

		switch (event.currentTarget.getAttribute("data-handler")) {

			case "eventData":

				const eventData = this.state.eventData;
				eventData[event.currentTarget.name] = event.currentTarget.value;

				this.setState({
					eventData,
				});

				break;

			case "newDay":

				this.setState({
					[event.currentTarget.name]: event.currentTarget.value,
				});
				console.log(event.currentTarget.value);

				break;


		}

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

}
