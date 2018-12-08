import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import moment from "moment";

import { IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList, ITimeZone } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { IDBDerbyVenueChange, IDerbyVenue, IDerbyVenueChange } from "interfaces/venue";

import { getGeography } from "services/geoService";
import { getTimeZones } from "services/timeService";
import { checkUserRole } from "services/userService";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

import CompareValues from "components/compareValues";

interface IReviewVenueChangeState {
	dataError: boolean;
	errorMessage: string;
	initialLoad: boolean;
	loading: boolean;
	modalOpen: boolean;
	path: string;
	rejectComment: string;
	status: null | "approved" | "rejected";
	userId: number;
	venueChanges: IDerbyVenueChange;
	venueData: IDerbyVenue;
}

export default class ReviewVenueChange extends React.Component<IProps> {

	state: IReviewVenueChangeState = {
		dataError: false,
		errorMessage: null,
		initialLoad: false,
		loading: true,
		modalOpen: false,
		path: "",
		rejectComment: "",
		status: null,
		userId: null,
		venueChanges: {} as IDerbyVenueChange,
		venueData: {} as IDerbyVenue,
	};

	axiosSignal = axios.CancelToken.source();

	constructor(props: IProps) {
		super(props);

		this.approveChange = this.approveChange.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.openRejectModal = this.openRejectModal.bind(this);
		this.rejectChange = this.rejectChange.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			detail: "Review Venue Change",
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
					<Link to="/dashboard/venues/changes">
						&laquo; Back to venue changes
					</Link>
				</p>

				<div className={`dashboard reviewVenueChange ${this.state.venueData.id ? "" : "newVenue"}`}>

					<h1>{this.state.initialLoad ? `Review ${this.state.venueData.id ? "Venue Change" : "New Venue"}` : ""}</h1>

					{this.state.loading ?

						<div className="loader" />

					: this.state.status === "approved" ?

						<p>Approval was successful.  The submitting user will receive an email.</p>

					: this.state.status === "rejected" ?

						<p>Rejection was successful.  The submitting user will receive an email.</p>

					:

					<React.Fragment>

						{this.state.venueData.id ?
							<div className="callout">
								<p className="header">KEY TO CHANGES</p>
								<p>
									<span className="old">Unchanged data</span>{" / "}
									<span className="removed">Replaced data</span>{" / "}
									<span className="new">New data</span>
								</p>
							</div>
						: ""}

						{this.state.venueChanges.changeId ?

							<React.Fragment>

								<dl className="changeDetails">

									<CompareValues
										label="Name"
										oldValue={this.state.venueData.name}
										newValue={this.state.venueChanges.name}
									/>

									<dt>Address:</dt>

									<dd>

										<CompareValues
											oldValue={this.state.venueData.address1}
											newValue={this.state.venueChanges.address1}
											inline={true}
										/><br />

										{this.state.venueData.address2 || this.state.venueChanges.address2 ?
											<React.Fragment>
												<CompareValues
													oldValue={this.state.venueData.address2}
													newValue={this.state.venueChanges.address2}
													inline={true}
												/>
												<br />
											</React.Fragment>
										: ""}

										<CompareValues
											oldValue={this.state.venueData.city}
											newValue={this.state.venueChanges.city}
											inline={true}
										/>

										{this.state.venueData.region || this.state.venueChanges.region ?
											<React.Fragment>
												{", "}
												<CompareValues
													oldValue={this.state.venueData.region}
													newValue={this.state.venueChanges.region}
													inline={true}
												/>
											</React.Fragment>
										: ""}

										{this.state.venueData.postcode || this.state.venueChanges.postcode ?
											<React.Fragment>
												{" "}
												<CompareValues
													oldValue={this.state.venueData.postcode}
													newValue={this.state.venueChanges.postcode}
													inline={true}
												/>
											</React.Fragment>
										: ""}<br />

										<CompareValues
											oldValue={this.state.venueData.countryName}
											newValue={this.state.venueChanges.countryName}
											inline={true}
										/>


									</dd>

									<CompareValues
										label="Web Page"
										oldValue={this.state.venueData.link}
										newValue={this.state.venueChanges.link}
									/>

									<CompareValues
										addFormatting={true}
										label="Description"
										oldValue={this.state.venueData.description}
										newValue={this.state.venueChanges.description}
									/>

									<CompareValues
										label="Time Zone"
										oldValue={this.state.venueData.timezone}
										newValue={this.state.venueChanges.timezone}
									/>

								</dl>

								<div className="buttonRow right">
									<p className="error">{this.state.errorMessage}</p>
									<button type="button" className="largeButton" onClick={this.approveChange}>Approve</button>
									<button type="button" className="largeButton pinkButton" onClick={this.openRejectModal}>Reject</button>
								</div>

							</React.Fragment>

						:

							<p>There was an error.</p>

						}


					</React.Fragment>

					}

				</div>

				<Modal
					isOpen={this.state.modalOpen}
					onRequestClose={this.closeModal}
					className="rejectChangeModal"
					overlayClassName="modalOverlay"
				>

					<div id="rejectChangeModal">

						<ReactSVG
							className="modalClose"
							title="close"
							src={CloseIcon}
							onClick={this.closeModal}
						/>

						<h2>Reject Change</h2>

						<form id="rejectionForm" onSubmit={this.rejectChange}>

							<div className="inputGroup">
								<p>
									Please enter a reason for rejecting the change.
									This will be included in an email to the user letting them know their change was rejected;
									it will also be stored in the database.
								</p>

								<label htmlFor="rejectComment">Reason</label>
								<textarea
									id="rejectComment"
									name="rejectComment"
									required={true}
									value={this.state.rejectComment}
									onChange={this.handleInputChange}
								/>
							</div>

							<div className="buttonRow">
								<button type="submit" disabled={!this.state.rejectComment} className="largeButton">Confirm Rejection</button>
								<button type="button" onClick={this.closeModal} className="largeButton">Cancel</button>
							</div>

						</form>

					</div>

				</Modal>

			</React.Fragment>

		);

	}

	approveChange(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.setState({
			loading: true,
		});

		axios.post(`${this.props.apiLocation}venues/approveChange/${this.props.match.params.changeId}`,
			{},
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					loading: false,
					status: "approved",
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						errorMessage: "Something went wrong.  Please reload the page and try again.",
						loading: false,
					});
				}

			});

	}

	closeModal() {

		this.setState({
			modalOpen: false,
			rejectComment: "",
		});

	}

	handleInputChange <T extends keyof IReviewVenueChangeState>(event: React.ChangeEvent<HTMLTextAreaElement>) {

		const fieldName: (keyof IReviewVenueChangeState) = event.currentTarget.name as (keyof IReviewVenueChangeState);

		const newState = ({
			[fieldName]: event.currentTarget.value,
		});

		this.setState(newState as { [P in T]: IReviewVenueChangeState[P]; });

	}

	openRejectModal(event: React.MouseEvent<HTMLButtonElement>) {

		event.preventDefault();

		this.setState({
			modalOpen: true,
		});

	}

	rejectChange(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			loading: true,
			modalOpen: false,
		});

		axios.post(`${this.props.apiLocation}venues/rejectChange/${this.props.match.params.changeId}`,
			{ comment: this.state.rejectComment },
			{
				cancelToken: this.axiosSignal.token,
				withCredentials: true,
			})
			.then((result) => {

				this.setState({
					loading: false,
					status: "rejected",
				});

			}).catch((error) => {
				console.error(error);

				if (!axios.isCancel(error)) {
					this.setState({
						errorMessage: "Something went wrong.  Please reload the page and try again.",
						loading: false,
					});
				}

			});

	}

	loadData() {

		this.setState({
			loading: true,
		});

		let countryList = [] as IGeoCountry[];
		let promiseError = false;
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;
		let timeZones = [] as ITimeZone[];

		promises.push(getGeography()
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getTimeZones()
			.then((dataResponse: ITimeZone[]) => {
				timeZones = dataResponse;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		Promise.all(promises).then(() => {

			if (!promiseError) {

				axios.get(`${this.props.apiLocation}venues/getChange/${this.props.match.params.changeId}`,
					{
						cancelToken: this.axiosSignal.token,
						withCredentials: true,
					})
					.then((result) => {

						const venueResult: IDBDerbyVenueChange = result.data;

						const venueData: IDerbyVenue = venueResult.changed_item_id ?
							{
								address1: venueResult.venue_address1,
								address2: venueResult.venue_address2,
								city: venueResult.venue_city,
								country: venueResult.country_code,
								countryName: venueResult.country_name,
								description: venueResult.venue_description,
								id: venueResult.venue_id,
								link: venueResult.venue_link,
								name: venueResult.venue_name,
								postcode: venueResult.venue_postcode,
								region: venueResult.region_abbreviation,
								timezone: timeZones.filter((tz: ITimeZone) => tz.timezone_id === venueResult.venue_timezone)[0].timezone_name,
							}
						: {} as IDerbyVenue;

						const venueChanges: IDerbyVenueChange = {
							address1: undefined,
							address2: undefined,
							changeId: venueResult.change_id,
							changedItemId: venueResult.venue_id,
							city: undefined,
							country: undefined,
							id: venueResult.venue_id,
							name: undefined,
							postcode: undefined,
							region: undefined,
							submittedDuration: moment.duration(moment(venueResult.change_submitted).diff(moment())).humanize(),
							submittedTime: moment(venueResult.change_submitted).format("MMM D, Y h:mm a"),
							timezone: undefined,
							user: venueResult.change_user,
							username: venueResult.change_user_name,
						};

						if (venueResult.change_object) {

							const changeObject = JSON.parse(venueResult.change_object);

							for (const key in changeObject) {
								if (changeObject.hasOwnProperty(key)) {

									switch (key) {

										case "country":
											venueChanges.country = changeObject.country;
											venueChanges.countryName = countryList.filter(
												(country: IGeoCountry) => country.country_code === changeObject[key])[0].country_name;
											break;

										case "region":
											if (changeObject.region) {
												venueChanges.region = regionLists[changeObject.country || venueData.country].filter(
													(region: IGeoRegion) => region.region_id === changeObject[key])[0].region_abbreviation;
											}
											break;

										case "timezone":
											venueChanges.timezone = timeZones.filter(
												(tz: ITimeZone) => tz.timezone_id === changeObject[key])[0].timezone_name;
											break;

										case "address1":
										case "address2":
										case "city":
										case "description":
										case "link":
										case "postcode":
										case "name":

											venueChanges[key] = changeObject[key];
											break;

									}

								}
							}

							this.setState({
								initialLoad: true,
								loading: false,
								venueChanges,
								venueData,
							});

						} else {

							this.setState({
								dataError: true,
								loading: false,
							});

						}


					}).catch((error) => {
						console.error(error);

						if (!axios.isCancel(error)) {
							this.setState({
								dataError: true,
								loading: false,
							});
						}

					});
				}

		});

	}

}
