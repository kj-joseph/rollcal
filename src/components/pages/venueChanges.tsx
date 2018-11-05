import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyVenueChange, IDerbyVenueChange } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

export default class EventChanges<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			eventChanges: [],
			loading: true,
			path: "",
			userId: null,
			venueChanges: [],
		};

		this.reviewChange = this.reviewChange.bind(this);

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (window.location.pathname !== this.state.path || this.props.loggedInUserId !== this.state.userId ) {

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

						<h1>Submitted Venue Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.eventChanges.length ?

							<ul className="boxList noIcons">

								{this.state.eventChanges.map((change: IDerbyVenueChange) => (

									<li className="list" key={change.id}>
										<p className="submittedTime">
											Submitted by <strong>{change.username}</strong> <span title={change.submittedTime}>{change.submittedDuration} ago</span>
										</p>
										<div className="buttonRow">
											<button type="button" data-change-id={change.id} onClick={this.reviewChange} className="smallButton">Review</button>
										</div>
										<h2>{change.name}</h2>
										<p className="listLocation">{change.location}</p>
									</li>

								))}

							</ul>

						:

							<p>There are currently no submitted changes to venues.</p>

						}


					</React.Fragment>

					}

				</div>

			</React.Fragment>

		);

	}

	reviewChange(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/venues/changes/${event.currentTarget.getAttribute("data-change-id")}`);

	}

	loadData() {

		this.setState({
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}venues/getChanges`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				const eventChanges = result.data.map((change: IDBDerbyVenueChange) => ({
					id: change.change_id,
					location: `${change.venue_city}${change.region_abbreviation ? ", " + change.region_abbreviation : ""}, ${change.country_code}`,
					name: change.venue_name,
					submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
					submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
					user: change.user_id,
					username: change.user_name,
				}));

				this.setState({
					eventChanges,
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
