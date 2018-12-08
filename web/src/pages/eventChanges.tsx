import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { IDBDerbyEventChange, IDerbyEventChange, IDerbyEventChangeObject } from "interfaces/event";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IProps } from "interfaces/redux";

import { getGeography } from "services/geoService";
import { formatDateRange } from "services/timeService";
import { checkUserRole } from "services/userService";

import BoxList from "components/boxList";

import moment from "moment";

interface IEventChangesState {
	dataError: boolean;
	eventChanges: [];
	loading: boolean;
	path: string;
	userId: number;
}

export default class EventChanges extends React.Component<IProps> {

	state: IEventChangesState = {
		dataError: false,
		eventChanges: [],
		loading: true,
		path: null,
		userId: null,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.reviewChange = this.reviewChange.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Review Event Changes",
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (!checkUserRole("reviewer")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId) {
				this.loadData();
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

						<h1>Submitted Event Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.eventChanges.length ?

							<BoxList
								data={this.state.eventChanges}
								itemType="events"
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
			loading: true,
		});

		let countryList = [] as IGeoCountry[];
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;

		promises.push(getGeography()
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((error) => {
				console.error(error);
			}));

		Promise.all(promises).then(() => {

			axios.get(`${this.props.apiLocation}events/getChangeList`,
				{
					cancelToken: this.axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {

					const eventChangeData: IDBDerbyEventChange[] = result.data;
					const eventPromises: Array<Promise<any>> = [];

					for (const change of eventChangeData) {

						eventPromises.push(new Promise((resolve, reject) => {

							if (change.changed_item_id) {

								resolve({
									changeId: change.change_id,
									changedItemId: change.changed_item_id,
									dates: formatDateRange({
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
								});

							} else {

								const changeObject: IDerbyEventChangeObject = JSON.parse(change.change_object);
								const eventChangeObject: IDerbyEventChange = {
									changeId: change.change_id,
									dayChanges: [],
									id: change.changed_item_id,
									name: undefined,
									submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
									submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
									user: change.change_user,
									username: change.change_user_name,
								};

								const name = changeObject.data.filter(
									(item) => item.field === "name")[0];
								const host = changeObject.data.filter(
									(item) => item.field === "host")[0];

								if (name) {
									eventChangeObject.name = name.value;
									eventChangeObject.host = host.value;
								} else {
									eventChangeObject.name = host.value;
								}

								let cityString: string;
								let countryCode: string;
								let regionAbbr: string;

								if (changeObject.newVenueData) {

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
													if (changeObject.newVenueData[key]) {
														regionAbbr = regionLists[changeObject.newVenueData.country].filter(
															(region: IGeoRegion) => region.region_id === changeObject.newVenueData[key])[0].region_abbreviation;
													}
													break;

											}
										}
									}

									eventChangeObject.location = `${cityString}${regionAbbr ? ", " + regionAbbr : ""}, ${countryCode}`;

									resolve(eventChangeObject);

								} else {

									const venueId = changeObject.data.filter(
										(item) => item.field === "venue")[0].value;

									if (venueId) {

										axios.get(`${this.props.apiLocation}venues/getVenueDetails/${venueId}`,
											{
												cancelToken: this.axiosSignal.token,
												withCredentials: true,
											})
											.then((venueResult) => {

												eventChangeObject.location = `${venueResult.data.venue_city}${
													venueResult.data.region_abbreviation ? ", " + venueResult.data.region_abbreviation : ""}, ${venueResult.data.venue_country}`;

												resolve(eventChangeObject);

											}).catch((venueError) => {
												console.error(venueError);
											});

									} else {
										resolve(eventChangeObject);
									}

								}

							}

						}));

					}

					Promise.all(eventPromises)
						.then((eventChanges: IDerbyEventChange[]) => {

							this.setState({
								eventChanges,
								loading: false,
							});

					}).catch((error) => {
						console.error(error);

						if (!axios.isCancel(error)) {
							this.setState({
								dataError: true,
							});
						}

					});


				}).catch((error) => {
					console.error(error);

					if (!axios.isCancel(error)) {
						this.setState({
							dataError: true,
						});
					}

				});


		});

	}

}
