import React from "react";
import { NavLink } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { IDBDerbyEvent, IDBDerbyVenue, IDerbyEvent, IDerbyVenue } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import PlusIcon from "images/plus-circle.svg";
import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import * as auth from "components/lib/auth";
import { formatDateRange } from "components/lib/dateTime";

export default class Dashboard<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			deleteEventId: null,
			deleteModalOpen: false,
			eventData: [],
			eventsLoading: true,
			modalProcessing: false,
			path: "",
			userId: "",
			venueData: [],
			venuesLoading: true,
		};

		this.activateTab = this.activateTab.bind(this);
		this.addEvent = this.addEvent.bind(this);
		this.addVenue = this.addVenue.bind(this);
		this.closeDeleteModal = this.closeDeleteModal.bind(this);
		this.confirmDeleteEvent = this.confirmDeleteEvent.bind(this);
		this.deleteEvent = this.deleteEvent.bind(this);
		this.editEvent = this.editEvent.bind(this);
		this.editVenue = this.editVenue.bind(this);
		this.logout = this.logout.bind(this);
		this.openAccountModal = this.openAccountModal.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {
			this.props.history.push("/");
		} else if (!this.props.match.params.operation) {
			this.props.history.push("/dashboard/events");
		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData(this.props.match.params.operation);
			}

		}

	}

	render() {

		return (

			<div className="dashboard">

				<h1>Hi, {this.props.loggedInUserName}!</h1>
				<div className="buttonRow userButtons">
					<button type="button" onClick={this.openAccountModal} className="largeButton">Your Account</button>
					<button type="button" onClick={this.logout} className="largeButton">Log out</button>
				</div>

				<div className="buttonRow tabButtons">
					<button
						type="button"
						onClick={this.activateTab}
						data-tab="events"
						className={`largeButton${this.props.match.params.operation === "events" ? " active" : ""}`}
					>
						Events
					</button>
					<button
						type="button"
						onClick={this.activateTab}
						data-tab="venues"
						className={`largeButton${this.props.match.params.operation === "venues" ? " active" : ""}`}
					>
						Venues
					</button>

				</div>

				{this.props.match.params.operation === "events" ?

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
										<div className="buttonRow">
											<button type="button" data-event-id={event.id} onClick={this.editEvent} className="smallButton">Edit</button>
											<button type="button" data-event-id={event.id} onClick={this.deleteEvent} className="smallButton pinkButton">Delete</button>
										</div>
										<p className="listDate">{event.dates_venue}</p>
										<h2>
											{event.name}
										</h2>
										{(event.host) ?	<h3>Hosted by {event.host}</h3> : ""}
										<p className="listLocation">{event.location}</p>
									</li>

								))}

							</ul>

							:

							<p>You haven't added any events yet.</p>

						}

					</div>

				: this.props.match.params.operation === "venues" ?

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
										<div className="buttonRow">
											<button type="button" data-venue-id={venue.id} onClick={this.editVenue} className="smallButton">Edit</button>
										</div>
										<h2>{venue.name}</h2>
										<p className="listLocation">{venue.location}</p>
									</li>

								))}

							</ul>

						:

								<p>You haven't added any venues yet.</p>

						}

					</div>

				: "" }

				<Modal
					isOpen={this.state.deleteModalOpen}
					onRequestClose={this.closeDeleteModal}
					className="deleteModal"
					overlayClassName="modalOverlay"
				>

					<div id="DeleteModal">

						{ this.state.modalProcessing ?

							<div className={"loader medium" + (this.state.processing ? "" : " disabled")} />

						:

							<React.Fragment>

								<ReactSVG
									className="modalClose"
									title="close"
									src={CloseIcon}
									onClick={this.closeDeleteModal}
								/>

								<h2>Confirm Deletion</h2>

								<p>Are you sure you want to delete this event?  You won't be able to get it back.</p>

								<div className="buttonRow">
									<button type="button" onClick={this.confirmDeleteEvent} className="largeButton pinkButton">Yes, Delete</button>
									<button type="button" onClick={this.closeDeleteModal} className="largeButton">Cancel</button>
								</div>

								{ this.state.modalError ?

									<p className="error">{this.state.modalError}</p>

								: "" }

							</React.Fragment>

						}

					</div>

				</Modal>

			</div>

		);

	}

	addEvent() {

		this.props.history.push("/dashboard/event/add");

	}

	addVenue() {

		this.props.history.push("/dashboard/venue/add");

	}

	activateTab(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();
		this.props.history.push(`/dashboard/${event.currentTarget.getAttribute("data-tab")}`);

	}

	closeDeleteModal(event?: React.MouseEvent<any>) {

		if (event) {
			event.preventDefault();
		}

		this.setState({
			deleteEventId: null,
			deleteModalOpen: false,
		});

	}

	confirmDeleteEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.setState({
			modalProcessing: true,
		});

		axios.delete(`${this.props.apiLocation}events/deleteEvent/${this.state.deleteEventId}`,
			{ withCredentials: true })
			.then((result: AxiosResponse) => {

				this.loadData(this.props.match.params.operation);

				this.setState({
					deleteModalOpen: false,
					modalProcessing: false,
				});

			}).catch((result: AxiosError) => {

				this.setState({
					modalError: "There was a problem trying to delete the event.",
					modalProcessing: false,
				});

			});

	}


	deleteEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.setState({
			deleteEventId: event.currentTarget.getAttribute("data-event-id"),
			deleteModalOpen: true,
		});

	}

	editEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/event/edit/${event.currentTarget.getAttribute("data-event-id")}`);

	}

	editVenue(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/venue/edit/${event.currentTarget.getAttribute("data-venue-id")}`);

	}

	loadData(func: string) {

		this.setState({
			eventData: [],
			eventsLoading: true,
			venueData: [],
			venuesLoading: true,
		});

		switch (func) {

			case "events":

				axios.get(`${this.props.apiLocation}events/search?user=${this.props.loggedInUserId}`
					+ `&startDate=${moment().format("Y-MM-DD")}`, { withCredentials: true })
					.then((result: AxiosResponse) => {

						const eventData = result.data.map((event: IDBDerbyEvent) => ({
								dates_venue: formatDateRange({
										firstDay: moment.utc(event.event_first_day),
										lastDay: moment.utc(event.event_last_day),
									}, "short"),
								host: event.event_name ? event.event_host : null,
								id: event.event_id,
								location: `${event.venue_city}${event.region_abbreviation ? ", " + event.region_abbreviation : ""}, ${event.country_code}`,
								name: event.event_name ? event.event_name : event.event_host,
							}));

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

				break;

			case "venues":

				axios.get(`${this.props.apiLocation}venues/getVenuesByUser/${this.props.loggedInUserId}`, { withCredentials: true })
					.then((result: AxiosResponse) => {

						const venueData = result.data.map((venue: IDBDerbyVenue) => ({
							city: venue.venue_city,
							country: venue.venue_country,
							id: venue.venue_id,
							location: `${venue.venue_city}${venue.region_abbreviation ? ", " + venue.region_abbreviation : ""}, ${venue.venue_country}`,
							name: venue.venue_name,
							user: venue.venue_user,
						}));

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

				break;

		}

	}

	logout(event: React.MouseEvent<HTMLButtonElement>) {

		auth.logout(this.props, event);

	}

	openAccountModal(event: React.MouseEvent<HTMLButtonElement>) {

		this.props.setAccountModalState(true);

	}

}
