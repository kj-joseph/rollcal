import React from "react";
import { Link } from "react-router-dom";

import { IDBDerbyEventChange, IDerbyEventChange } from "components/interfaces";

import axios, { AxiosError, AxiosResponse } from "axios";

import { formatDateRange } from "components/lib/dateTime";
import moment from "moment";

import { IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList } from "components/interfaces";
import { getGeography } from "components/lib/data";

import BoxList from "components/partials/boxList";

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

							<BoxList
								data={this.state.eventChanges}
								itemType="venues"
								listType="review"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
								reviewFunction={this.reviewChange}
							/>

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

		let countryList = [] as IGeoCountry[];
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;

		promises.push(getGeography(this.props)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		Promise.all(promises).then(() => {

			axios.get(`${this.props.apiLocation}events/getChangeList`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					const eventChanges = result.data.map((change: IDBDerbyEventChange) => {

						if (change.changed_item_id) {

							return {
								changeId: change.change_id,
								changedItemId: change.changed_item_id,
								datesVenue: formatDateRange({
										firstDay: moment.utc(change.event_first_day),
										lastDay: moment.utc(change.event_last_day),
									}, "short"),
								host: change.event_name ? change.event_host : null,
								id: change.changed_item_id,
								location: `${change.venue_city}${change.region_abbreviation ? ", " + change.region_abbreviation : ""}, ${change.country_code}`,
								name: change.event_name ? change.event_name : change.event_host,
								submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
								submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
								user: change.change_user,
								username: change.change_user_name,
							};

						} else {

							const changeObject: {[key: string]: any} = JSON.parse(change.change_object);
							const eventChangeObject: {[key: string]: any} = {
								changeId: change.change_id,
								submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
								submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
								user: change.change_user,
								username: change.change_user_name,
							};

							const name = changeObject.data.filter(
								(item: {field: string, venue: string}) => item.field === "name")[0];
							const host = changeObject.data.filter(
								(item: {field: string, venue: string}) => item.field === "host")[0];

							if (name) {
								eventChangeObject.name = name.value;
								eventChangeObject.host = host.value;
							} else {
								eventChangeObject.name = host.value;
							}

							let cityString: string;
							let countryCode: string;
							let regionAbbr: string;

							for (const key in changeObject.newVenueData) {
								if (changeObject.newVenueData.hasOwnProperty(key)) {

									switch (key) {

										case "city":
											cityString = changeObject.newVenueData[key];
											break;

										case "country":
											countryCode = countryList.filter(
												(country: IGeoCountry) => country.country_code === changeObject.newVenueData[key])[0].country_code;
											break;

										case "region":
											regionAbbr = regionLists[changeObject.newVenueData.country].filter(
												(region: IGeoRegion) => region.region_id === changeObject.newVenueData[key])[0].region_abbreviation;
											break;

									}
								}
							}

							eventChangeObject.location = `${cityString}${regionAbbr ? ", " + regionAbbr : ""}, ${countryCode}`;

							return eventChangeObject;
						}

					});

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

		});
	}

}
