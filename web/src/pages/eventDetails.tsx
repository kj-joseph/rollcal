import RCComponent from "components/rcComponent";
import React from "react";
import FormatText from "react-format-text";
import { Link } from "react-router-dom";

import { getEventDetails } from "services/eventService";
import { getSearchUrl } from "services/searchService";

import FeatureIconSet from "components/featureIconSet";
import Flag from "components/flag";

import moment from "moment";

import { IDerbyEvent, IDerbyEventDay } from "interfaces/event";
import { IProps } from "interfaces/redux";

interface IEventDetailsState {
	dataError: boolean;
	eventData: IDerbyEvent;
	loading: boolean;
	path: string;
}

export default class EventDetails extends RCComponent<IProps> {

	state: IEventDetailsState = {
		dataError: false,
		eventData: null,
		loading: true,
		path: null,
	};

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

	render() {

		return (

			<React.Fragment>

				{this.props.match.params.eventId ?

				<React.Fragment>

					{this.props.lastSearch ?
						<p className="backToLink">
							<Link to={getSearchUrl(this.props.lastSearch)}>
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

							{this.state.eventData.user.userId === this.props.loggedInUserId ?
								<div className="buttonRow cornerButton">
									<button type="button" onClick={this.editEvent} className="largeButton">Edit Event</button>
								</div>
							: null}

							<div className="data">

								<div className="eventInfo">
									<h1>
										{this.state.eventData.name ?
											this.state.eventData.name
										: this.state.eventData.host}
									</h1>

									{this.state.eventData.name ?
										<h3>Hosted by {this.state.eventData.host}</h3>
									: null}

									<p className="eventDate"><strong>{this.state.eventData.dates}</strong></p>

									{(this.state.eventData.link) ?
										<p className="eventLink">
											<a href={this.state.eventData.link} target="_blank" rel="noopener noreferrer">
												{this.state.eventData.name ?
													this.state.eventData.name
												: "Event"} website
											</a>
										</p>
									: null}

								</div>

								{(this.state.eventData.description) ?
									<p><FormatText>{this.state.eventData.description}</FormatText></p>
								: null}

								<div className="eventVenueInfo">
									<address>
										<strong>{this.state.eventData.venue.name}</strong><br />
										{this.state.eventData.venue.address1}<br />
										{(this.state.eventData.venue.address2) ?
											<React.Fragment>
												<span>
													{this.state.eventData.venue.address2}
												</span>
												<br />
											</React.Fragment>
										: null}
										{this.state.eventData.venue.city} {
											this.state.eventData.venue.region && this.state.eventData.venue.region.abbreviation ?
												this.state.eventData.venue.region.abbreviation
											: null
										} {this.state.eventData.venue.postcode}<br />
										{this.state.eventData.venue.country.name}
										{this.state.eventData.venue.country.flag ?
											<Flag country={this.state.eventData.venue.country} />
										: null}
									</address>

									{this.state.eventData.venue.link ?

										<p className="venueLink">
											<a href={this.state.eventData.venue.link} target="_blank" rel="noopener noreferrer">
												{this.state.eventData.venue.name} website
											</a>
										</p>

									: null}

									{this.state.eventData.venue.description ?
										<p className="venueDescription">{this.state.eventData.venue.description}</p>
									: null}
								</div>

								{this.state.eventData.days && this.state.eventData.days.length ?

									<div className="eventDays">
										<h4>Days</h4>
										<dl>
										{this.state.eventData.days.map((day: IDerbyEventDay) => (
											<React.Fragment key={day.date}>
												<dt><strong>{day.date}:</strong>{moment(day.startTime, "HH:mm:00").format("h:mm a")}
													{day.doorsTime ?
														` (Doors: ${moment(day.doorsTime, "HH:mm:00").format("h:mm a")})`
													: null}
												</dt>
												<dd><FormatText>{day.description}</FormatText></dd>
											</React.Fragment>
										))}
										</dl>
									</div>

									:

									<div className="eventTime">
										<p>
											<strong>Start time:</strong> {this.state.eventData.days[0].startTime}
											{this.state.eventData.days[0].doorsTime
												? ` (Doors: ${this.state.eventData.days[0].doorsTime})` : null}
										</p>
									</div>

								}

								<p><em>All times shown are local to the venue.</em></p>

								<p className="eventUser">
									Event added by {this.state.eventData.user.userName}
									{this.state.eventData.user.userId === this.props.loggedInUserId ?
										" (thank you!)"
									: null}
								</p>

							</div>

							<FeatureIconSet
								data={[
									{
										items: this.state.eventData.features.tracks,
										label: {
											plural: "Tracks",
											singular: "Track",
										},
										type: "track",
									},
									{
										items: this.state.eventData.features.derbytypes,
										label: {
											plural: "Derby Types",
											singular: "Derby Type",
										},
										type: "derbytype",
									},
									{
										items: this.state.eventData.features.sanctions,
										label: {
											plural: "Sanctions",
											singular: "sanction",
										},
										type: "sanction",
									},
								]}
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

		const getEventData = this.addPromise(
			getEventDetails(this.props.match.params.eventId));

		getEventData
			.then((event: IDerbyEvent) => {

				this.props.setPageTitle({
					detail: event.name ? event.name : event.host,
				});

				this.setState({
					eventData: event,
					loading: false,
				});

			})
			.catch((error: ErrorEvent) => {

				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(getEventData.clear);

	}

}
