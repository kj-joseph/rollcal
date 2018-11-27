import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import EventIcons from "components/partials/eventIcons";
import { IDBDerbyEvent, IDerbyEvent, IDerbyEventDayFormatted } from "interfaces/event";
import { IDerbyIcons, IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IProps } from "interfaces/redux";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes } from "components/lib/data";
import { formatDateRange } from "components/lib/dateTime";
import moment from "moment";

import { checkUserRole } from "components/lib/auth";

interface IEventDetailsState {
	dataError: boolean;
	eventData: IDerbyEvent;
	loading: boolean;
	path: string;
}

export default class EventDetails extends React.Component<IProps> {

	state: IEventDetailsState = {
		dataError: false,
		eventData: null,
		loading: true,
		path: null,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.editEvent = this.editEvent.bind(this);
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
		this.props.setPageTitle({
			page: "Event Details",
		});

	}

	componentWillUnmount() {
		this.axiosSignal.cancel();
	}

	render() {

		return (

			<React.Fragment>
				{this.props.match.params.eventId ?

				<React.Fragment>
					{this.props.lastSearch ?
						<p className="backToLink">
							<Link to={`${this.props.lastSearch}`}>
								&laquo; Back to search results
							</Link>
						</p>
					:
						<p className="backToLink">
							<Link to={"/"}>
								&laquo; Back to event list
							</Link>
						</p>
					}
					{this.state.loading ?

						<div className="loader" />

					: this.state.dataError ?

						<div>
							<h1>Event Details</h1>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<div className="eventDetails">

							{this.state.eventData.user === this.props.loggedInUserId ?
								<div className="buttonRow cornerButton">
									<button type="button" onClick={this.editEvent} className="largeButton">Edit Event</button>
								</div>
							: ""}

							<div className="data">

								<div className="eventInfo">
									<h1>{this.state.eventData.name}</h1>
									{(this.state.eventData.host) ?  <h3>Hosted by {this.state.eventData.host}</h3> : ""}

									<p className="eventDate"><strong>{this.state.eventData.datesVenue}</strong></p>

									{(this.state.eventData.link) ?
										<p className="eventLink">
											<a href={this.state.eventData.link} target="_blank" rel="noopener noreferrer">
												{this.state.eventData.name} website
											</a>
										</p>
										: ""
									}
								</div>


								{(this.state.eventData.description) ?
									<p>{this.state.eventData.description}</p>
									: ""
								}

								<div className="eventVenueInfo">
									<address>
										<strong>{this.state.eventData.venueName}</strong><br />
										{this.state.eventData.address1}<br />
										{(this.state.eventData.address2) ?
											<React.Fragment>
												<span>
													{this.state.eventData.address2}
												</span>
												<br />
											</React.Fragment>
											: ""
										}
										{this.state.eventData.location} {this.state.eventData.postcode}<br />
										{this.state.eventData.country} {this.state.eventData.flag}
									</address>
									{(this.state.eventData.venueLink) ?
										<p className="venueLink">
											<a href={this.state.eventData.venueLink} target="_blank" rel="noopener noreferrer">
												{this.state.eventData.venueName} website
											</a>
										</p>
										: ""
									}

									{(this.state.eventData.venueDescription) ?
										<p className="venueDescription">{this.state.eventData.venueDescription}</p>
										: ""
									}
								</div>

								{(this.state.eventData.multiDay) ?
									<div className="eventDays">
										<h4>Days</h4>
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
									:
									<div className="eventTime">
										<p>
											<strong>Start time:</strong> {this.state.eventData.days[0].startTime}
											{this.state.eventData.days[0].doorsTime
												? ` (Doors: ${this.state.eventData.days[0].doorsTime})` : ""}
										</p>
									</div>
								}

								<p><em>All times shown are local to the venue.</em></p>

								<p className="eventUser">
									Event added by {

										checkUserRole(this.props.loggedInUserRoles, "admin") ?

											<Link to={`/dashboard/admin/user/${this.state.eventData.user}`}>{this.state.eventData.username}</Link>

										:

											this.state.eventData.username

									}{this.state.eventData.user === this.props.loggedInUserId ? " (thank you!)" : ""}
								</p>

							</div>

							<EventIcons
								icons={this.state.eventData.icons}
								showLabels={true}
							/>

						</div>

					}

				</React.Fragment>

				:

				<div className="eventDetails">
					<h1>Event Details</h1>
					<p>Sorry, there was an error. Please try again.</p>
				</div>

				}

			</React.Fragment>

		);

	}

	editEvent(event: React.MouseEvent<HTMLButtonElement>) {
		this.props.history.push(`/dashboard/events/edit/${this.props.match.params.eventId}`);
	}

	loadData() {

		axios.get(`${this.props.apiLocation}events/getEventDetails/${this.props.match.params.eventId}`,
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				if (result.data) {

					const eventResult: IDBDerbyEvent = result.data;
					const icons: IDerbyIcons = {
						derbytypes: [],
						sanctions: [],
						tracks: [],
					};
					let promiseError = false;
					const promises: Array<Promise<void>> = [];

					if (eventResult.derbytypes) {

						promises.push(getDerbyTypes(
							this.props.apiLocation,
							this.props.dataDerbyTypes,
							this.props.saveDataDerbyTypes,
							this.axiosSignal)
							.then((dataResponse: IDerbyType[]) => {
								icons.derbytypes =
									dataResponse.filter((dt: IDerbyType) =>
										eventResult.derbytypes.split(",").indexOf(dt.derbytype_id.toString()) > -1 )
											.map((dt: IDerbyType) => ({
												filename: `derbytype-${dt.derbytype_abbreviation}`,
												title: dt.derbytype_name,
											}));
							}).catch(() => {
								promiseError = true;
							}));

					}

					if (eventResult.sanctions) {

						promises.push(getDerbySanctions(
							this.props.apiLocation,
							this.props.dataSanctions,
							this.props.saveDataSanctions,
							this.axiosSignal)
							.then((dataResponse: IDerbySanction[]) => {
								icons.sanctions =
									dataResponse.filter((s: IDerbySanction) =>
										eventResult.sanctions.split(",").indexOf(s.sanction_id.toString()) > -1 )
											.map((s: IDerbySanction) => ({
												filename: `sanction-${s.sanction_abbreviation}`,
												title: `${s.sanction_name} (${s.sanction_abbreviation})`,
											}));
							}).catch(() => {
								promiseError = true;
							}));

					}

					if (eventResult.tracks) {

						promises.push(getDerbyTracks(
							this.props.apiLocation,
							this.props.dataTracks,
							this.props.saveDataTracks,
							this.axiosSignal)
							.then((dataResponse: IDerbyTrack[]) => {
								icons.tracks =
									dataResponse.filter((t: IDerbyTrack) =>
										eventResult.tracks.split(",").indexOf(t.track_id.toString()) > -1 )
											.map((t: IDerbyTrack) => ({
												filename: `track-${t.track_abbreviation}`,
												title: t.track_name,
											}));
							}).catch(() => {
								promiseError = true;
							}));

					}

					Promise.all(promises).then(() => {

						if (!promiseError) {

							this.setState({
								eventData: {
									address1: eventResult.venue_address1,
									address2: eventResult.venue_address2,
									country: eventResult.country_name,
									datesVenue: formatDateRange({
											firstDay: moment.utc(eventResult.days[0].eventday_start_venue),
											lastDay: moment.utc(eventResult.days[eventResult.days.length - 1].eventday_start_venue),
										}, "long"),
									days: eventResult.days.map((day) => ({
										date: moment.utc(day.eventday_start_venue).format("MMM D"),
										description: day.eventday_description,
										doorsTime: day.eventday_doors_venue
											&& day.eventday_doors_venue < day.eventday_start_venue
											? moment.utc(day.eventday_doors_venue).format("h:mm a")
											: "",
										startTime: moment.utc(day.eventday_start_venue).format("h:mm a"),
									})),
									description: eventResult.event_description,
									flag: eventResult.country_flag ? <span title={eventResult.country_name} className={`flag-icon flag-icon-${eventResult.country_flag}`} /> : null,
									host: eventResult.event_name ? eventResult.event_host : null,
									icons,
									id: eventResult.event_id,
									link: eventResult.event_link,
									location: `${eventResult.venue_city}${eventResult.region_abbreviation ?
										`, ${eventResult.region_abbreviation}` : ""}`,
									multiDay: eventResult.days.length > 1,
									name: eventResult.event_name ? eventResult.event_name : eventResult.event_host,
									postcode: eventResult.venue_postcode,
									user: eventResult.user_id,
									username: eventResult.user_name,
									venueDescription: eventResult.venue_description,
									venueLink: eventResult.venue_link,
									venueName: eventResult.venue_name,
								},
								loading: false,
							});

							this.props.setPageTitle({
								detail: eventResult.event_name ? eventResult.event_name : eventResult.event_host,
							});

						}

					}).catch(() => {

						if (!promiseError) {
							this.setState({
								dataError: true,
								loading: false,
							});
						}

					});

				} else {
					// no result, likely bad event ID in URL

					this.setState({
						dataError: true,
						loading: false,
					});

				}

			}).catch((error) => {

				if (!axios.isCancel(error)) {
					console.error(error);
					this.setState({
						dataError: true,
						loading: false,
					});
				}

			});

	}

}
