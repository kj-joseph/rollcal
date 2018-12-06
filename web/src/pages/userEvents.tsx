import React from "react";
import { Link } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import { IBoxListItem } from "interfaces/boxList";
import { IDBDerbyEvent } from "interfaces/event";
import { IProps } from "interfaces/redux";

import axios from "axios";

import moment from "moment";

import CheckIcon from "images/check-circle.svg";
import CircleIcon from "images/circle.svg";
import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import BoxList from "components/boxList";
import { formatDateRange } from "services/timeService";
import { checkUserRole } from "services/userService";

interface IUserEventsState {
	deleteEventId: number;
	deleteModalOpen: boolean;
	eventData: IBoxListItem[];
	isReviewer: boolean;
	loading: boolean;
	modalError: string;
	modalProcessing: boolean;
	path: string;
	showAll: boolean;
	userId: number;
}

export default class UserEvents extends React.Component<IProps> {

	state: IUserEventsState = {
		deleteEventId: null,
		deleteModalOpen: false,
		eventData: [],
		isReviewer: false,
		loading: true,
		modalError: null,
		modalProcessing: false,
		path: null,
		showAll: false,
		userId: null,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.addEvent = this.addEvent.bind(this);
		this.closeDeleteModal = this.closeDeleteModal.bind(this);
		this.confirmDeleteEvent = this.confirmDeleteEvent.bind(this);
		this.deleteEvent = this.deleteEvent.bind(this);
		this.editEvent = this.editEvent.bind(this);
		this.toggleShowAll = this.toggleShowAll.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Add/Edit Events",
			page: "User Dashboard",
		});
	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole(this.props.loggedInUserRoles, "user")) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

			const isReviewer = checkUserRole(this.props.loggedInUserRoles, "reviewer");

			this.setState({
				isReviewer,
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData(isReviewer);
			}

		}

	}

	componentWillUnmount() {
		this.axiosSignal.cancel();
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

						<h1>Edit Events</h1>

						{this.state.isReviewer ?

							<div className="showAll">
							<a href="" onClick={this.toggleShowAll}>
								<ReactSVG
									className={this.state.showAll ? "hidden" : ""}
									src={CircleIcon}
								/>
								<ReactSVG
									className={this.state.showAll ? "" : "hidden"}
									src={CheckIcon}
								/>
								Show All Events
							</a>
							</div>

						: ""}

						{this.state.eventData.length ?

							<BoxList
								data={this.state.eventData.filter((event: IBoxListItem) =>
									event.user === this.props.loggedInUserId
									|| (this.state.isReviewer
										&& this.state.showAll))}
								deleteFunction={this.deleteEvent}
								editFunction={this.editEvent}
								itemType="events"
								listType="edit"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
							/>

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

									<div className="loader medium" />

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

										: ""}

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
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.loadData();

				this.setState({
					deleteModalOpen: false,
					modalProcessing: false,
				});

			}).catch((error) => {

				if (!axios.isCancel(error)) {
					this.setState({
						modalError: "There was a problem trying to delete the event.",
						modalProcessing: false,
					});
				}

			});

	}

	deleteEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.setState({
			deleteEventId: Number(event.currentTarget.getAttribute("data-item-id")),
			deleteModalOpen: true,
		});

	}

	editEvent(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/events/edit/${event.currentTarget.getAttribute("data-item-id")}`);

	}

	toggleShowAll(event: React.MouseEvent<HTMLElement>) {

		event.preventDefault();

		this.setState({
			showAll: !this.state.showAll,
		});

	}

	loadData(isReviewer = false) {

		this.setState({
			loading: true,
		});

		axios.get(`${this.props.apiLocation}events/search${isReviewer ? "" : `?user=${this.props.loggedInUserId}`}`
			+ `${isReviewer ? "?" : "&"}startDate=${moment().format("Y-MM-DD")}`,
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				const eventData = result.data.events.map((event: IDBDerbyEvent) => ({
						dates: formatDateRange({
								firstDay: moment.utc(event.event_first_day),
								lastDay: moment.utc(event.event_last_day),
							}, "short"),
						host: event.event_name ? event.event_host : null,
						id: event.event_id,
						location: `${event.venue_city}${event.region_abbreviation ? ", " + event.region_abbreviation : ""}, ${event.country_code}`,
						name: event.event_name ? event.event_name : event.event_host,
						user: event.event_user,
					}));

				this.setState({
					eventData,
					loading: false,
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						loading: false,
					});
				}

			});

	}

}
