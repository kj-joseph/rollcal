import React from "react";
import { Link } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { IDBDerbyEvent, IDerbyEvent } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import { formatDateRange } from "components/lib/dateTime";

export default class UserEvents<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			allEvents: false,
			deleteEventId: null,
			deleteModalOpen: false,
			eventData: [],
			loading: true,
			modalProcessing: false,
			path: "",
			userId: null,
		};

		this.addEvent = this.addEvent.bind(this);
		this.closeDeleteModal = this.closeDeleteModal.bind(this);
		this.confirmDeleteEvent = this.confirmDeleteEvent.bind(this);
		this.deleteEvent = this.deleteEvent.bind(this);
		this.editEvent = this.editEvent.bind(this);

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

			const allEvents = (this.props.match.params.all === "all"
					&& this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1);

			this.setState({
				allEvents,
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData(allEvents);
			}

		}

	}

	render() {

		return (

			<React.Fragment>

				<p className="backToLink">
					<Link to="/dashboard">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div className="dashboard">

					{this.state.loading ?

						<div className="loader" />

					:

					<React.Fragment>

						<div className="buttonRow cornerButton">
							<button type="button" onClick={this.addEvent} className="largeButton">New Event</button>
						</div>

						<h1>{this.state.allEvents ? "All" : "Your"} Events</h1>

						{this.state.eventData.length ?

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

					</React.Fragment>

					}

				</div>

			</React.Fragment>

		);

	}

	addEvent() {

		this.props.history.push("/dashboard/events/add");

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

				this.loadData();

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

		this.props.history.push(`/dashboard/events/edit/${event.currentTarget.getAttribute("data-event-id")}`);

	}

	loadData(allEvents = false) {

		this.setState({
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}events/search${allEvents ? "" : `?user=${this.props.loggedInUserId}`}`
			+ `${allEvents ? "?" : "&"}startDate=${moment().format("Y-MM-DD")}`, { withCredentials: true })
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
					loading: false,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
				});

			});

	}

}
