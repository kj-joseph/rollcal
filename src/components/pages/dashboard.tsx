import React from "react";
import { NavLink } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { IDerbyEvent, IDerbyVenue } from "components/interfaces";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import moment from "moment";

import ReactSVG from "react-svg";

import PlusIcon from "images/plus-circle.svg";

import * as auth from "components/lib/auth";
import { formatDateRange } from "components/lib/dateTime";

export default class Dashboard<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			eventData: [],
			eventsLoading: true,
			path: "",
			userId: "",
			venueData: [],
			venuesLoading: true,
		};

		this.addEvent = this.addEvent.bind(this);
		this.addVenue = this.addVenue.bind(this);
		this.logout = this.logout.bind(this);
		this.openAccountModal = this.openAccountModal.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.setState({
			path: null as string,
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {
			this.props.history.push("/");
		}

		if (window.location.pathname !== this.state.path
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

	render() {

		return (

			<div className="dashboard">

				<h1>Hi, {this.props.loggedInUserName}!</h1>
				<div className="buttonRow">
					<button type="button" onClick={this.openAccountModal} className="largeButton">Account</button>
					<button type="button" onClick={this.logout} className="largeButton pinkButton">Log out</button>
				</div>


				<div className="userEventList">

					<h2>
						Events You've Added
						<ReactSVG
							title="Add New Event"
							src={PlusIcon}
							onClick={this.addEvent}
						/>
					</h2>

					{this.state.eventsLoading ?

						<div className="loader" />

					: this.state.eventData.length ?

						<ul className="boxList noIcons">

							{this.state.eventData.map((event: IDerbyEvent) => (

								<li className="list" key={event.id}>
									<p className="listDate">{event.dates_venue}</p>
									<h2><NavLink to={`/dashboard/event/${event.id}/edit`} title={`Edit ${event.name}`}>
										{event.name}
									</NavLink></h2>
									{(event.host) ?	<h3>Hosted by {event.host}</h3> : ""}
									<p className="listLocation">{event.location}</p>
								</li>

							))}

						</ul>

						:

							<p>You haven't added any events yet.</p>

					}

				</div>

				<div className="userVenueList">

					<h2>
						Venues You've Added
						<ReactSVG
							title="Add New Venue"
							src={PlusIcon}
							onClick={this.addVenue}
						/>
					</h2>

					{this.state.venuesLoading ?

						<div className="loader" />

					: this.state.venueData.length ?

						<ul className="boxList noIcons">

							{this.state.venueData.map((venue: IDerbyVenue) => (

								<li className="list" key={venue.id}>
									<h2><NavLink to={`/dashboard/venue/${venue.id}/edit`} title={`Edit ${venue.name}`}>
										{venue.name}
									</NavLink></h2>
									<p className="listLocation">{venue.location}</p>
								</li>

							))}

						</ul>

					:

							<p>You haven't added any venues yet.</p>

					}

				</div>

			</div>

		);

	}

	addEvent() {

		this.props.history.push(`/dashboard/event/add`);

	}

	addVenue() {

		this.props.history.push(`/dashboard/venue/add`);

	}

	loadData() {

		this.setState({
			eventData: [],
			eventsLoading: true,
			venueData: [],
			venuesLoading: true,
		});

		axios.get(`${this.props.apiLocation}events/search?user=${this.props.loggedInUserId}`
			+ `&startDate=${moment().format("YYYY-MM-DD")}`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				const eventData = [];

				for (const event of result.data.response) {

					eventData.push({
						dates_venue: formatDateRange({
								firstDay: moment.utc(event.days[0].eventday_start_venue),
								lastDay: moment.utc(event.days[event.days.length - 1].eventday_start_venue),
							}, "short"),
						host: event.event_name ? event.event_host : null,
						id: event.event_id,
						location: `${event.venue_city}${event.region_abbreviation ? ", " + event.region_abbreviation : ""}, ${event.country_code}`,
						name: event.event_name ? event.event_name : event.event_host,
					});
				}

				this.setState({
					eventData,
					eventsLoading: false,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
				});

			});

		axios.get(`${this.props.apiLocation}venues/getVenuesByUser/${this.props.loggedInUserId}`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				const venueData = [];

				for (const venue of result.data.response) {

					venueData.push({
						id: venue.venue_id,
						location: `${venue.venue_city}${venue.region_abbreviation ? ", " + venue.region_abbreviation : ""}, ${venue.country_code}`,
						name: venue.venue_name,
						region: venue.venue_region,
					});

				}

				this.setState({
					venueData,
					venuesLoading: false,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
				});

			});


	}

	logout(event: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

	openAccountModal(event: React.MouseEvent<HTMLButtonElement>) {

		this.props.setAccountModalState(true);

	}

}
