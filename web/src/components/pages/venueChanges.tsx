import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import moment from "moment";

import { IBoxListItem } from "interfaces/boxList";
import { IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { IDBDerbyVenueChange, IDerbyVenueChange, IDerbyVenueChangeObject } from "interfaces/venue";

import { checkUserRole } from "components/lib/auth";
import { getGeography } from "components/lib/data";
import BoxList from "components/partials/boxList";

interface IVenueChangesState {
	loading: boolean;
	path: string;
	userId: number;
	venueChanges: IBoxListItem[];
}

export default class VenueChanges extends React.Component<IProps> {

	state: IVenueChangesState = {
		loading: true,
		path: null,
		userId: null,
		venueChanges: [],
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.reviewChange = this.reviewChange.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {

			this.props.history.push("/");

		} else if (!checkUserRole(this.props.loggedInUserRoles, "reviewer")) {

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

						<h1>Submitted Venue Changes</h1>

						<p>Details listed below are the original details; click <strong>Review</strong> to see the changes and approve or reject them.</p>

						{this.state.venueChanges.length ?

							<BoxList
								data={this.state.venueChanges}
								itemType="venues"
								listType="review"
								loggedInUserId={this.props.loggedInUserId}
								noIcons={true}
								reviewFunction={this.reviewChange}
							/>

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
			loading: true,
		});

		let countryList = [] as IGeoCountry[];
		let promiseError = false;
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;

		promises.push(getGeography(
			this.props.apiLocation,
			this.props.dataGeography,
			this.props.saveDataGeography,
			this.axiosSignal)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		Promise.all(promises).then(() => {

			if (!promiseError) {

				axios.get(`${this.props.apiLocation}venues/getChangeList`,
					{
						cancelToken: this.axiosSignal.token,
						withCredentials: true,
					})
					.then((result) => {

						const venueChanges = result.data.map((change: IDBDerbyVenueChange) => {

							if (change.changed_item_id) {

								return {
									changeId: change.change_id,
									id: change.changed_item_id,
									location: `${change.venue_city}${change.region_abbreviation ? ", " + change.region_abbreviation : ""}, ${change.country_code}`,
									name: change.venue_name,
									submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
									submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
									user: change.change_user,
									username: change.change_user_name,
								};

							} else {

								const changeObject: IDerbyVenueChangeObject = JSON.parse(change.change_object);
								const venueChangeObject: IDerbyVenueChange = {
									address1: undefined,
									address2: undefined,
									changeId: change.change_id,
									changedItemId: change.changed_item_id,
									city: undefined,
									country: undefined,
									id: change.changed_item_id,
									name: undefined,
									postcode: undefined,
									region: undefined,
									submittedDuration: moment.duration(moment(change.change_submitted).diff(moment())).humanize(),
									submittedTime: moment(change.change_submitted).format("MMM D, Y h:mm a"),
									timezone: undefined,
									user: change.change_user,
									username: change.change_user_name,
								};

								let cityString: string;
								let countryCode: string;
								let regionAbbr: string;

								for (const key in changeObject) {
									if (changeObject.hasOwnProperty(key)) {

										switch (key) {

											case "city":
												cityString = changeObject[key];
												break;

											case "country":
												countryCode = countryList.filter(
													(country: IGeoCountry) => country.country_code === changeObject[key])[0].country_code;
												break;

											case "name":
												venueChangeObject[key] = changeObject[key];
												break;

											case "region":
												regionAbbr = regionLists[changeObject.country].filter(
													(region: IGeoRegion) => region.region_id === changeObject[key])[0].region_abbreviation;
												break;

										}
									}
								}

								venueChangeObject.location = `${cityString}${regionAbbr ? ", " + regionAbbr : ""}, ${countryCode}`;

								return venueChangeObject;

							}

						});

						this.setState({
							loading: false,
							venueChanges,
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

		});
	}

}
