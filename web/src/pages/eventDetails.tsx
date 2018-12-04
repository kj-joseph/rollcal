import React from "react";
import FormatText from "react-format-text";
import { Link } from "react-router-dom";

import { IDerbyEvent, IDerbyEventDay } from "interfaces/event";
import { IDerbyFeature } from "interfaces/feature";
import { IProps } from "interfaces/redux";

import { getEvent } from "services/event";

import FeatureIcon from "components/featureIcon";

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
		// ?
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

							{this.state.eventData.user.userId === this.props.loggedInUserId ?
								<div className="buttonRow cornerButton">
									<button type="button" onClick={this.editEvent} className="largeButton">Edit Event</button>
								</div>
							: ""}

							<div className="data">

								<div className="eventInfo">
									<h1>{this.state.eventData.name}</h1>
									{(this.state.eventData.host) ?  <h3>Hosted by {this.state.eventData.host}</h3> : ""}

									<p className="eventDate"><strong>{this.state.eventData.dates}</strong></p>

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
									<p><FormatText>{this.state.eventData.description}</FormatText></p>
									: ""
								}

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
											: ""
										}
										{this.state.eventData.venue.location} {this.state.eventData.venue.postcode}<br />
										{this.state.eventData.venue.country.name} {this.state.eventData.venue.country.flag}
									</address>

									{(this.state.eventData.venue.link) ?
										<p className="venueLink">
											<a href={this.state.eventData.venue.link} target="_blank" rel="noopener noreferrer">
												{this.state.eventData.venue.name} website
											</a>
										</p>
										: ""
									}

									{(this.state.eventData.venue.description) ?
										<p className="venueDescription">{this.state.eventData.venue.description}</p>
										: ""
									}
								</div>

								{(this.state.eventData.days && this.state.eventData.days.length) ?
									<div className="eventDays">
										<h4>Days</h4>
										<dl>
										{this.state.eventData.days.map((day: IDerbyEventDay) => (
											<React.Fragment key={day.date}>
												<dt><strong>{day.date}:</strong>{day.startTime}
													{day.doorsTime ? ` (Doors: ${day.doorsTime})` : ""}
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
												? ` (Doors: ${this.state.eventData.days[0].doorsTime})` : ""}
										</p>
									</div>
								}

								<p><em>All times shown are local to the venue.</em></p>

								<p className="eventUser">
									Event added by {this.state.eventData.user.userName
										}{this.state.eventData.user.userId === this.props.loggedInUserId ? " (thank you!)" : ""}
								</p>

							</div>

							<div className="featureIcons">

								{(this.state.eventData.features.tracks && this.state.eventData.features.tracks.length ?
									<span className="featureIconGroup">

										<span className="label">Track{
											this.state.eventData.features.tracks.length > 1 ?
												"s" : ""}</span>

										{this.state.eventData.features.tracks.map((track: IDerbyFeature) => (

											<FeatureIcon
												key={track.id}
												feature={track}
												type="track"
											/>

										))}

									</span>
									: "" )}

								{(this.state.eventData.features.derbytypes && this.state.eventData.features.derbytypes.length ?
									<span className="featureIconGroup">

										<span className="label">Derby Type{
											this.state.eventData.features.derbytypes.length > 1 ?
												"s" : ""}</span>

										{this.state.eventData.features.derbytypes.map((derbytype: IDerbyFeature) => (

											<FeatureIcon
												key={derbytype.id}
												feature={derbytype}
												type="derbytype"
											/>

										))}

									</span>
									: "" )}

								{(this.state.eventData.features.sanctions && this.state.eventData.features.sanctions.length ?
									<span className="featureIconGroup">

										<span className="label">Sanction{
											this.state.eventData.features.sanctions.length > 1 ?
												"s" : ""}</span>

										{this.state.eventData.features.sanctions.map((sanction: IDerbyFeature) => (

											<FeatureIcon
												key={sanction.id}
												feature={sanction}
												type="sanction"
											/>

										))}

									</span>
									: "" )}

							</div>

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

		getEvent(this.props.match.params.eventId)
			.then((event: IDerbyEvent) => {

				this.props.setPageTitle({
					detail: event.name ? event.name : event.host,
				});

				this.setState({
					eventData: event,
					loading: false,
				});

			})
			.catch((error) => {

				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
				});

			});

	}

}
