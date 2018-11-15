import React from "react";
import { Link } from "react-router-dom";

import { IBoxListItem, IDBDerbyVenue } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import CheckIcon from "images/check-circle.svg";
import CircleIcon from "images/circle.svg";
import ReactSVG from "react-svg";

import BoxList from "components/partials/boxList";

export default class UserVenues<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			isReviewer: false,
			loading: true,
			path: "",
			userId: null,
			venueData: [],
		};

		this.addVenue = this.addVenue.bind(this);
		this.editVenue = this.editVenue.bind(this);
		this.toggleShowAll = this.toggleShowAll.bind(this);

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

			const isReviewer = (this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1);

			this.setState({
				isReviewer,
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
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

						{this.state.isReviewer} {

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

						}

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
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}venues/${
			isReviewer ? "getAllVenues"
				: `getVenuesByUser/${this.props.loggedInUserId}`
		}`, { withCredentials: true })
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
					loading: false,
					venueData,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
				});

			});

	}

}
