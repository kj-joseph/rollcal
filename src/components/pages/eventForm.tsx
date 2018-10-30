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
			selectedEventFeatures: [] as string[],
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
							id="accountForm"
							onSubmit={this.submitEventForm}
						>

							<h3
								className = {"formSectionHeader"
									+ (this.state.sectionOpenBasic ? " open" : " closed")
									+ (this.state.eventData.host ? " ok" : "")}
								data-section = "Basic"
								onClick={this.toggleSection}
							>
								Basic Event Information
							</h3>

							<div className = {"formSection" + (this.state.sectionOpenBasic ? " open" : " closed")}>

								<div className="inputGroup">
									<label htmlFor="name">Event Name <em>(optional)</em></label>
									<input
										id="name"
										name="name"
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
										required={false}
										value={this.state.eventData.event_description}
										onChange={this.handleInputChange}
									/>
								</div>

							</div>

							<h3
								className = {"formSectionHeader" + (this.state.sectionOpenDays ? " open" : " closed")}
								data-section = "Days"
								onClick={this.toggleSection}
							>
								Event Days ({this.state.eventData.days.length})
							</h3>

							<div className = {"formSection" + (this.state.sectionOpenDays ? " open" : " closed")}>



							</div>

							<h3
								className = {"formSectionHeader" + (this.state.sectionOpenFeatures ? " open" : " closed")}
								data-section = "Features"
								onClick={this.toggleSection}
							>
								Event Features ({this.state.selectedEventFeatures.length})
							</h3>

							<div className = {"formSection" + (this.state.sectionOpenFeatures ? " open" : " closed")}>

								{this.state.eventFeatures.tracks ?
									<div className="derbyFeatures">
										{(this.state.eventFeatures.tracks.length ?
											<span className="eventIconGroup eventIconTracks">
												<span className="label">Tracks</span>
												{this.state.eventFeatures.tracks.map((icon: IDerbyTrack) => (
													<FeatureIcon
														imageClass={this.state.selectedEventFeatures.indexOf("track-" + icon.track_id) > -1 ? "selected" : ""}
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
												<span className="label">Derby Types</span>
												{this.state.eventFeatures.derbytypes.map((icon: IDerbyType) => (
													<FeatureIcon
														imageClass={this.state.selectedEventFeatures.indexOf("derbytype-" + icon.derbytype_id) > -1 ? "selected" : ""}
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
												<span className="label">Sanctions</span>
												{this.state.eventFeatures.sanctions.map((icon: IDerbySanction) => (
													<FeatureIcon
														imageClass={this.state.selectedEventFeatures.indexOf("sanction-" + icon.sanction_id) > -1 ? "selected" : ""}
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


							<div className="eventVenueInfo">
								<address>
									<strong>{this.state.eventData.venue_name}</strong><br />
									{this.state.eventData.address1}<br />
									{(this.state.eventData.address2) ?
										<span>{this.state.eventData.address2}</span>
										: ""
									}
									{this.state.eventData.location} {this.state.eventData.flag}
								</address>
								{(this.state.eventData.venue_link) ?
									<p className="venueLink">
										<a href={this.state.eventData.venue_link} target="_blank" rel="noopener noreferrer">
											{this.state.eventData.venue_name} website
										</a>
									</p>
									: ""
								}

								{(this.state.eventData.venue_description) ?
									<p className="venueDescription">{this.state.eventData.venue_description}</p>
									: ""
								}
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

							if (eventResult.derbytypes) {

								for (const derbytype of eventResult.derbytypes.split(",")) {
									this.toggleFeatureIcon(`derbytype-${derbytype.trim()}`);
								}

							}

							if (eventResult.sanctions) {

								for (const sanction of eventResult.sanctions.split(",")) {
									this.toggleFeatureIcon(`sanction-${sanction.trim()}`);
								}

							}

							if (eventResult.tracks) {

								for (const track of eventResult.tracks.split(",")) {
									this.toggleFeatureIcon(`track-${track.trim()}`);
								}

							}

							this.setState({
								eventData: {
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
								},
								loading: false,
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

		let eventData = this.state.eventData;

		eventData[event.currentTarget.name] = event.currentTarget.value;

		this.setState({
			eventData,
		});

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

	toggleSection(event: React.MouseEvent<HTMLHeadingElement>) {

		event.preventDefault();

		this.setState({
			[`sectionOpen${event.currentTarget.getAttribute("data-section")}`]: !this.state[`sectionOpen${event.currentTarget.getAttribute("data-section")}`],
		});

	}

}
