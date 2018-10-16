import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import { IDBDerbyEvent, IDerbyEvent, IDerbyEventDayFormatted, IDerbyIcon, IDerbyIcons } from "interfaces";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import * as moment from "moment";

import { formatDateRange } from "lib/dateTime";

import EventIcons from "components/eventIcons";

export default class EventDetails<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			dataError: false,
			eventData: [] as IDerbyEvent[],
			limit: this.props.limit || 12,
			loading: true,
		};

		axios.get(`${this.props.apiLocation}events/getEventDetails/${this.props.match.params.eventId}`)
			.then((result: AxiosResponse) => {

				const eventResult: IDBDerbyEvent = result.data.response[0];

				const eventDays = [] as IDerbyEventDayFormatted[];
				for (let d = 0; d < eventResult.days.length; d ++) {
					const day: IDerbyEventDayFormatted = {
						date: moment.utc(eventResult.days[d].eventday_start_venue).format("MMM D"),
						description: eventResult.days[d].eventday_description,
						startTime: moment.utc(eventResult.days[d].eventday_start_venue).format("h:mm a"),
					};
					eventDays.push(day);
				}

				const icons: IDerbyIcons = {
					derbytypes: [],
					sanctions: [],
					tracks: [],
				};

				for (let t = 0; t < eventResult.tracks.length; t ++) {
					icons.tracks.push({
						filename: `track-${eventResult.tracks[t].track_abbreviation}`,
						title: eventResult.tracks[t].track_name,
					});
				}
				for (let dt = 0; dt < eventResult.derbytypes.length; dt ++) {
					icons.derbytypes.push({
						filename: `derbytype-${eventResult.derbytypes[dt].derbytype_abbreviation}`,
						title: eventResult.derbytypes[dt].derbytype_name,
					});
				}
				for (let s = 0; s < eventResult.sanctions.length; s ++) {
					icons.sanctions.push({
						filename: `sanction-${eventResult.sanctions[s].sanction_abbreviation}`,
						title: eventResult.sanctions[s].sanction_name,
					});
				}

				this.setState({
					eventData: [{
						address1: eventResult.venue_address1,
						address2: eventResult.venue_address2,
						dates_venue: formatDateRange({
								firstDay: moment.utc(eventResult.days[0].eventday_start_venue),
								lastDay: moment.utc(eventResult.days[eventResult.days.length - 1].eventday_start_venue),
							}, "long"),
						days: eventDays,
						event_description: eventResult.event_description,
						event_link: eventResult.event_link,
						flag: eventResult.country_flag ? <span title={eventResult.country_name} className={`flag-icon flag-icon-${eventResult.country_flag}`} /> : null,
						host: eventResult.event_name ? eventResult.event_host : null,
						icons,
						id: eventResult.event_id,
						location: `${eventResult.venue_city} ${eventResult.region_abbreviation ? ", " + eventResult.region_abbreviation : ""}, ${eventResult.country_code}`,
						multiDay: eventResult.days.length > 1,
						name: eventResult.event_name ? eventResult.event_name : eventResult.event_host,
						user: eventResult.user_name,
						venue_description: eventResult.venue_description,
						venue_link: eventResult.venue_link,
						venue_name: eventResult.venue_name,
					}],
					loading: false,
				});
			}).catch((error) => {
				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
				});
			});

	}

	shouldComponentUpdate(nextProps: Props, nextState: any) {
		if (this.state.eventData !== nextState.eventData
			|| this.state.dataError !== nextState.dataError) {
			return true;
		}
		return false;
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.changePage("eventDetails");
		this.props.setMenuState(false);
	}

	render() {

		return (
			<div>
				{this.props.match.params.eventId && !this.state.dataError ?
				<div>
					<p className="backToSearch" onClick={this.props.history.goBack}>
						&laquo; Back to search results
					</p>
					{this.state.loading ?
						<div className="loader" />
					: ""
					}
					{this.state.eventData.length === 0 && !this.state.loading ?
						<p>Sorry, there was an error. Please try again.</p>
					: ""
					}
					{this.state.eventData.length > 0 && !this.state.loading ?
						<div className="eventDetails">

							<div className="data">

								<div className="eventInfo">
									<h1>{this.state.eventData[0].name}</h1>
									{(this.state.eventData[0].host) ?  <h3>Hosted by {this.state.eventData[0].host}</h3> : ""}

									<p className="eventDate"><strong>{this.state.eventData[0].dates_venue}</strong></p>

									{(this.state.eventData[0].event_link) ?
										<p className="eventLink"><a href={this.state.eventData[0].event_link} target="_blank">{this.state.eventData[0].name} website</a></p>
										: ""
									}
								</div>


								{(this.state.eventData[0].event_description) ?
									<p>{this.state.eventData[0].event_description}</p>
									: ""
								}

								<div className="eventVenueInfo">
									<address>
										<strong>{this.state.eventData[0].venue_name}</strong><br />
										{this.state.eventData[0].address1}<br />
										{(this.state.eventData[0].address2) ?
											<span>{this.state.eventData[0].address2}</span>
											: ""
										}
										{this.state.eventData[0].location} {this.state.eventData[0].flag}
									</address>
									{(this.state.eventData[0].venue_link) ?
										<p className="venueLink"><a href={this.state.eventData[0].venue_link} target="_blank">{this.state.eventData[0].venue_name} website</a></p>
										: ""
									}

									{(this.state.eventData[0].venue_description) ?
										<p className="venueDescription">{this.state.eventData[0].venue_description}</p>
										: ""
									}
								</div>

								{(this.state.eventData[0].multiDay) ?
									<div className="eventDays">
										<h4>Days</h4>
										<dl>
										{this.state.eventData[0].days.map((day: IDerbyEventDayFormatted) => (
											<React.Fragment key={day.date}>
												<dt><strong>{day.date}:</strong>{day.startTime}</dt>
												<dd>{day.description}</dd>
											</React.Fragment>
										))}
										</dl>
									</div>
									:
									<div className="eventTime">
										<p><strong>Start time:</strong> {this.state.eventData[0].days[0].startTime}</p>
									</div>
								}

								<p className="eventUser">Event entered by {this.state.eventData[0].user}</p>
							</div>

							<EventIcons
								icons={this.state.eventData[0].icons}
								showLabels={true}
							/>

						</div>
					: ""
					}

				</div>
				:
				<div>
					<h1>Event Details</h1>
					<p>Sorry, there was an error. Please try again.</p>
				</div>
				}
			</div>
		);

	}

}
