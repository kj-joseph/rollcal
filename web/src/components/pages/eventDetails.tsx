import React from "react";
import { Link } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import EventIcons from "components/partials/eventIcons";
import { IDBDerbyEvent, IDerbyEvent, IDerbyEventDayFormatted } from "interfaces/event";
import { IDerbyIcons, IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IProps } from "interfaces/redux";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes } from "components/lib/data";
import { formatDateRange } from "components/lib/dateTime";
import moment from "moment";

interface IEventDetailsState {
	dataError: boolean;
	eventData: IDerbyEvent;
	loading: boolean;
	path: string;
}

export default class EventDetails extends React.Component<IProps, IEventDetailsState> {

	constructor(props: IProps) {
		super(props);

		this.state = {
			dataError: false,
			eventData: null,
			loading: true,
			path: null,
		};

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

						<div className="eventDetails">
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
									Event added by {this.state.eventData.username}{this.state.eventData.user === this.props.loggedInUserId ? " (thank you!)" : ""}
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

		axios.get(`${this.props.apiLocation}events/getEventDetails/${this.props.match.params.eventId}`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				if (result.data) {

					const eventResult: IDBDerbyEvent = result.data;

					const icons: IDerbyIcons = {
						derbytypes: [],
						sanctions: [],
						tracks: [],
					};
					const promises: Array<Promise<void>> = [];

					if (eventResult.derbytypes) {

						promises.push(getDerbyTypes(this.props)
							.then((dataResponse: IDerbyType[]) => {
								icons.derbytypes =
									dataResponse.filter((dt: IDerbyType) =>
										eventResult.derbytypes.split(",").indexOf(dt.derbytype_id.toString()) > -1 )
											.map((dt: IDerbyType) => ({
												filename: `derbytype-${dt.derbytype_abbreviation}`,
												title: dt.derbytype_name,
											}));
							}));

					}

					if (eventResult.sanctions) {

						promises.push(getDerbySanctions(this.props)
							.then((dataResponse: IDerbySanction[]) => {
								icons.sanctions =
									dataResponse.filter((s: IDerbySanction) =>
										eventResult.sanctions.split(",").indexOf(s.sanction_id.toString()) > -1 )
											.map((s: IDerbySanction) => ({
												filename: `sanction-${s.sanction_abbreviation}`,
												title: `${s.sanction_name} (${s.sanction_abbreviation})`,
											}));
							}));

					}

					if (eventResult.tracks) {

						promises.push(getDerbyTracks(this.props)
							.then((dataResponse: IDerbyTrack[]) => {
								icons.tracks =
									dataResponse.filter((t: IDerbyTrack) =>
										eventResult.tracks.split(",").indexOf(t.track_id.toString()) > -1 )
											.map((t: IDerbyTrack) => ({
												filename: `track-${t.track_abbreviation}`,
												title: t.track_name,
											}));
							}));

					}

					Promise.all(promises).then(() => {

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

	}

}
