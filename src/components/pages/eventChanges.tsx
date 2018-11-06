import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyEventChange, IDerbyEventChange } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import { formatDateRange } from "components/lib/dateTime";
import moment from "moment";

import { IGeoCountry, IGeoRegion } from "components/interfaces";
import { getGeography } from "components/lib/data";

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

						<h1>Submitted Event Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.eventChanges.length ?

							<ul className="boxList noIcons">

								{this.state.eventChanges.map((change: IDerbyEventChange) => (

									<li className="list" key={change.changeId}>
										<p className="submittedTime">
											<strong>{change.changedItemId ? "Change" : "New event"}</strong>
											<br />
											<span title={change.submittedTime}>{change.submittedDuration} ago</span>{" "}
											by <strong>{change.username}</strong>
										</p>
										<div className="buttonRow">
											<button type="button" data-change-id={change.changeId} onClick={this.reviewChange} className="smallButton">Review</button>
										</div>
										<p className="listDate">{change.datesVenue}</p>
										<h2>{change.name}</h2>
										{(change.host) ?	<h3>Hosted by {change.host}</h3> : ""}
										<p className="listLocation">{change.location}</p>
									</li>

								))}

							</ul>

						:

							<p>There are currently no submitted changes to events.</p>

						}


					</React.Fragment>

					}

				</div>

			</React.Fragment>

		);

	}

	reviewChange(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.props.history.push(`/dashboard/events/changes/${event.currentTarget.getAttribute("data-change-id")}`);

	}

	loadData() {

		this.setState({
			eventData: [],
			loading: true,
		});

		axios.get(`${this.props.apiLocation}events/getChangeList`, { withCredentials: true })
			.then((result: AxiosResponse) => {

				const eventChanges = result.data.map((change: IDBDerbyEventChange) => ({
					changeId: change.change_id,
					changedItemId: change.changed_item_id,
					datesVenue: formatDateRange({
							firstDay: moment.utc(change.event_first_day),
							lastDay: moment.utc(change.event_last_day),
						}, "short"),
					host: change.event_name ? change.event_host : null,
					location: `${change.venue_city}${change.region_abbreviation ? ", " + change.region_abbreviation : ""}, ${change.country_code}`,
					name: change.event_name ? change.event_name : change.event_host,
					submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
					submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
					user: change.change_user,
					username: change.change_user_name,
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
