import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import Modal from "react-modal";
Modal.setAppElement("#root");

import moment from "moment";

import CheckIcon from "images/check-circle.svg";
import CircleIcon from "images/circle.svg";
import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import { IDerbyEvent } from "interfaces/event";
import { IProps } from "interfaces/redux";

import { mapEventsToBoxList } from "services/boxListService";
import { deleteEvent, loadEvents } from "services/eventService";
import { checkUserRole } from "services/userService";

import BoxList from "components/boxList";

interface IUserEventsState {
	deleteEventId: number;
	deleteModalOpen: boolean;
	eventData: IDerbyEvent[];
	isReviewer: boolean;
	loading: boolean;
	modalError: string;
	modalProcessing: boolean;
	path: string;
	showAll: boolean;
	userId: number;
}

export default class EditEventsList extends RCComponent<IProps> {

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

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

			const isReviewer = checkUserRole("reviewer");

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

	render() {

		return (

			<>

				<p className="backToLink">
					<Link to="/dashboard">
						&laquo; Back to dashboard
					</Link>
				</p>

				<div className="dashboard">

					{this.state.loading ?

						<div className="loader" />

					:

					<>

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

						: null}

						{this.state.eventData.length ?

							<BoxList
								data={mapEventsToBoxList(
									this.state.eventData.filter((event) =>
										event.user.userId === this.props.loggedInUserId
										|| (this.state.isReviewer && this.state.showAll)))}
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

									<>

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

										: null}

									</>

								}

							</div>

						</Modal>

					</>

					}

				</div>

			</>

		);

	}

	addEvent() {

		this.props.history.push("/dashboard/events/add");

	}

	closeDeleteModal(event?: React.MouseEvent<any>): void {

		if (event) {
			event.preventDefault();
		}

		this.setState({
			deleteEventId: null,
			deleteModalOpen: false,
		});

	}

	confirmDeleteEvent(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.setState({
			modalProcessing: true,
		});

		const eventDeletion = this.addPromise(
			deleteEvent(this.state.deleteEventId));

		eventDeletion
			.then(() => {

				this.setState({
					deleteModalOpen: false,
					modalProcessing: false,
				});

				this.loadData();

			}).catch((error) => {

				this.setState({
					modalError: "There was a problem trying to delete the event.",
					modalProcessing: false,
				});

			})
			.finally(eventDeletion.clear);

	}

	deleteEvent(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.setState({
			deleteEventId: Number(event.currentTarget.getAttribute("data-item-id")),
			deleteModalOpen: true,
		});

	}

	editEvent(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.props.history.push(`/dashboard/events/edit/${event.currentTarget.getAttribute("data-item-id")}`);

	}

	toggleShowAll(event: React.MouseEvent<HTMLElement>): void {

		event.preventDefault();

		this.setState({
			showAll: !this.state.showAll,
		});

	}

	loadData(isReviewer = false): void {

		this.setState({
			loading: true,
		});

		const getEvents = this.addPromise(
			loadEvents({
				startDate: moment().format("Y-MM-DD"),
				user: isReviewer ? undefined : this.props.loggedInUserId,
			}));

		getEvents
			.then((response) => {

				this.setState({
					eventData: response.events,
					loading: false,
				});

			}).catch((error) => {
				console.error(error);

				this.setState({
					loading: false,
				});

			})
			.finally(getEvents.clear);

	}

}
