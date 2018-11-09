import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyVenue, IDerbyVenue } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

export default class UserVenues<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			allVenues: false,
			loading: true,
			path: "",
			userId: null,
			venueData: [],
		};

		this.addVenue = this.addVenue.bind(this);
		this.editVenue = this.editVenue.bind(this);

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

			const allVenues = (this.props.match.params.all === "all"
					&& this.props.loggedInUserRoles && this.props.loggedInUserRoles.indexOf("reviewer") > -1);

			this.setState({
				allVenues,
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData(allVenues);
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

						<h1>{this.state.allVenues ? "All" : "Your"} Venues</h1>

						{this.state.venueData.length ?

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

		this.props.history.push(`/dashboard/venues/edit/${event.currentTarget.getAttribute("data-venue-id")}`);

	}

	loadData(allVenues = false) {

		this.setState({
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}venues/${
			allVenues ? "getAllVenues"
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
