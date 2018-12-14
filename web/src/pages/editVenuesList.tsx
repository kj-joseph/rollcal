import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import CheckIcon from "images/check-circle.svg";
import CircleIcon from "images/circle.svg";
import ReactSVG from "react-svg";

import { IProps } from "interfaces/redux";
import { IDerbyVenue } from "interfaces/venue";

import { mapVenuesToBoxList } from "services/boxListService";
import { checkUserRole } from "services/userService";
import { loadVenues } from "services/venueService";

import BoxList from "components/boxList";

interface IUserVenuesState {
	isReviewer: boolean;
	loading: boolean;
	path: string;
	showAll: boolean;
	userId: number;
	venueData: IDerbyVenue[];
}

export default class EditVenuesList extends RCComponent<IProps> {

	state: IUserVenuesState = {
		isReviewer: false,
		loading: true,
		path: null,
		showAll: false,
		userId: null,
		venueData: [],
	};

	constructor(props: IProps) {
		super(props);

		this.addVenue = this.addVenue.bind(this);
		this.editVenue = this.editVenue.bind(this);
		this.toggleShowAll = this.toggleShowAll.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Add/Edit Venues",
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
							<button type="button" onClick={this.addVenue} className="largeButton">New Venue</button>
						</div>

						<h1>Edit Venues</h1>

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

						{this.state.venueData.length ?

							<BoxList
								data={mapVenuesToBoxList(
									this.state.venueData.filter((venue) =>
										venue.user.userId === this.props.loggedInUserId
										|| (this.state.isReviewer
											&& this.state.showAll)))}
								editFunction={this.editVenue}
								itemType="venues"
								listType="edit"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
							/>

						:

							<p>You haven't added any venues yet.</p>

						}

					</>

					}

				</div>

			</>

		);

	}

	addVenue() {

		this.props.history.push("/dashboard/venues/add");

	}


	editVenue(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/venues/edit/${event.currentTarget.getAttribute("data-item-id")}`);

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

		const getVenues = this.addPromise(
			loadVenues(
				isReviewer ?
					undefined : this.props.loggedInUserId));

		getVenues
			.then((venueData: IDerbyVenue[]) => {

				this.setState({
					loading: false,
					venueData,
				});

			}).catch((error) => {
				console.error(error);

				this.setState({
					loading: false,
				});

			});

	}

}
