import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import CheckIcon from "images/check-circle.svg";
import CircleIcon from "images/circle.svg";
import ReactSVG from "react-svg";

import { IBoxListItem } from "interfaces/boxList";
import { IProps } from "interfaces/redux";
import { IDBDerbyVenue } from "interfaces/venue";

import { checkUserRole } from "services/user";

import BoxList from "components/boxList";

interface IUserVenuesState {
	isReviewer: boolean;
	loading: boolean;
	path: string;
	showAll: boolean;
	userId: number;
	venueData: IBoxListItem[];
}

export default class UserVenues extends React.Component<IProps, IUserVenuesState> {

	state: IUserVenuesState = {
		isReviewer: false,
		loading: true,
		path: null,
		showAll: false,
		userId: null,
		venueData: [],
	};

	axiosSignal = axios.CancelToken.source();

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

						: ""}

						{this.state.venueData.length ?

							<BoxList
								data={this.state.venueData.filter((venue: IBoxListItem) =>
									venue.user === this.props.loggedInUserId
									|| (this.state.isReviewer
										&& this.state.showAll))}
								editFunction={this.editVenue}
								itemType="venues"
								listType="edit"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
							/>

						:

							<p>You haven't added any venues yet.</p>

						}

					</React.Fragment>

					}

				</div>

			</React.Fragment>

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

		axios.get(`${this.props.apiLocation}venues/${
			isReviewer ? "getAllVenues"
				: `getVenuesByUser/${this.props.loggedInUserId}`
			}`,
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				const venueData = result.data.map((venue: IDBDerbyVenue) => ({
					city: venue.venue_city,
					country: venue.venue_country,
					id: venue.venue_id,
					location: `${venue.venue_city}${venue.region_abbreviation ? ", " + venue.region_abbreviation : ""}, ${venue.venue_country}`,
					name: venue.venue_name,
					user: venue.venue_user,
				}));

				this.setState({
					loading: false,
					venueData,
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
