import RCComponent from "components/rcComponent";
import React from "react";
import FormatText from "react-format-text";
import { Link } from "react-router-dom";

import { getEventDetails } from "services/eventService";
import { mapFeaturesFromText } from "services/featureService";
import { getSearchUrl } from "services/searchService";
import { formatDateRange } from "services/timeService";

import FeatureIconSet from "components/featureIconSet";
import Flag from "components/flag";

import moment from "moment";

import { IDerbyEvent, IDerbyEventDay } from "interfaces/event";
import { IDerbyFeatureType } from "interfaces/feature";
import { IProps } from "interfaces/redux";

interface IEventDetailsState {
	dataError: boolean;
	eventData: IDerbyEvent;
	features: IDerbyFeatureType[];
	loading: boolean;
	path: string;
}

export default class EventDetails extends RCComponent<IProps> {

	state: IEventDetailsState = {
		dataError: false,
		eventData: null,
		features: [],
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

			<>

				{this.props.match.params.eventId ?

				<>

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

							{this.state.eventData.user.id === this.props.user.id ?
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

									<p className="eventDate">
										<strong>
											{formatDateRange({
												end: moment(this.state.eventData.dates.end),
												start: moment(this.state.eventData.dates.start),
											})}
										</strong>
									</p>

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
											<>
												<span>
													{this.state.eventData.venue.address2}
												</span>
												<br />
											</>
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

								{this.state.eventData.days && this.state.eventData.days.length > 1 ?

									<div className="eventDays">
										<h4>Days</h4>
										<dl>
										{this.state.eventData.days
											.map((day: IDerbyEventDay) => (

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
											<strong>Start time:</strong> {moment(this.state.eventData.days[0].startTime, "HH:mm:00").format("h:mm a")}
											{this.state.eventData.days[0].doorsTime
												? ` (Doors: ${moment(this.state.eventData.days[0].doorsTime, "HH:mm:00").format("h:mm a")})` : null}
										</p>
									</div>

								}

								<p><em>All times shown are local to the venue.</em></p>

								<p className="eventUser">
									Event added by {this.state.eventData.user.name}
									{this.state.eventData.user.id === this.props.user.id ?
										" (thank you!)"
									: null}
								</p>

							</div>

							<FeatureIconSet
								data={this.state.features}
								labels={true}
							/>

						</div>

					}

				</>

				:

				<div className="eventDetails">
					<h1>Event Details</h1>
					<p>Sorry, there was an error. Please try again.</p>
				</div>

				}

			</>

		);

	}

	editEvent(event: React.MouseEvent<HTMLButtonElement>): void {

		this.props.history.push(`/dashboard/events/edit/${this.props.match.params.eventId}`);

	}

	loadData(): void {

		const getEventData = this.addPromise(
			getEventDetails(this.props.match.params.eventId));

		getEventData
			.then((event: IDerbyEvent) => {

				this.props.setPageTitle({
					detail: event.name ? event.name : event.host,
				});

				const getFeatures = this.addPromise(
					mapFeaturesFromText(event.features));

				getFeatures
					.then((features: IDerbyFeatureType[]) => {

						this.setState({
							eventData: event,
							features,
							loading: false,
						});

					})
					.catch((error) => {

						console.error(error);

						this.setState({
							dataError: true,
							loading: false,
						});

					})
					.finally(getEventData.clear);

			})
			.catch((error) => {

				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(getEventData.clear);

	}

}
