import React from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import moment from "moment";

import { IDBDerbyEventChange, IDerbyEvent, IDerbyEventChange, IDerbyEventChangeObject } from "interfaces/event";
import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoCountry, IGeoData, IGeoRegionList, ITimeZone } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { IDBDerbyVenue, IDerbyVenue, INewDerbyVenue } from "interfaces/venue";

import { checkUserRole } from "components/lib/auth";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography, getTimeZones } from "components/lib/data";

import CompareValues from "components/partials/compareValues";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IReviewEventChangeState {
	dataError: boolean;
	errorMessage: string;
	eventChanges: IDerbyEventChange;
	eventData: IDerbyEvent;
	initialLoad: boolean;
	loading: boolean;
	modalOpen: boolean;
	path: string;
	rejectComment: string;
	status: null | "approved" | "rejected";
	userId: number;
}

export default class ReviewEventChange extends React.Component<IProps> {

	state: IReviewEventChangeState = {
		dataError: false,
		errorMessage: null,
		eventChanges: {} as IDerbyEventChange,
		eventData: {} as IDerbyEvent,
		initialLoad: false,
		loading: true,
		modalOpen: false,
		path: null,
		rejectComment: null,
		status: null,
		userId: null,
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
			detail: "Review Event Change",
			page: "User Dashboard",
		});

	}

	componentDidUpdate() {

		if (!this.props.loggedIn || !checkUserRole(this.props.loggedInUserRoles, "user")) {

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
					<Link to="/dashboard/events/changes">
						&laquo; Back to event changes
					</Link>
				</p>

				<div className={`dashboard reviewEventChange ${this.state.eventData.id ? "" : "newEvent"}`}>

					<h1>{this.state.initialLoad ? `Review ${this.state.eventData.id ? "Event Change" : "New Event"}` : ""}</h1>

					{this.state.loading ?

						<div className="loader" />

					: this.state.status === "approved" ?

						<p>Approval was successful.  The submitting user will receive an email.</p>

					: this.state.status === "rejected" ?

						<p>Rejection was successful.  The submitting user will receive an email.</p>

					:

					<React.Fragment>

						{this.state.eventData.id ?
							<div className="callout">
								<p className="header">KEY TO CHANGES</p>
								<p>
									<span className="old">Unchanged data</span>{" / "}
									<span className="removed">Replaced data</span>{" / "}
									<span className="new">New data</span>
								</p>
							</div>
						: ""}

						{this.state.eventChanges.changeId ?

							<React.Fragment>

								<div className="entryForm">
									<div className="formContainer">

										<div>
											<h3 className="formSectionHeader noOpener"><span>Basic Event Information</span></h3>
											<div className="formSection">

												<dl className="changeDetails">

													<CompareValues
														label="Name"
														oldValue={this.state.eventData.name}
														newValue={this.state.eventChanges.name}
													/>

													<CompareValues
														label="Host"
														oldValue={this.state.eventData.host}
														newValue={this.state.eventChanges.host}
													/>

													<CompareValues
														label="Web Page"
														oldValue={this.state.eventData.link}
														newValue={this.state.eventChanges.link}
													/>

													<CompareValues
														label="Description"
														oldValue={this.state.eventData.description}
														newValue={this.state.eventChanges.description}
													/>

												</dl>

											</div>
										</div>

										<div>
											<h3 className="formSectionHeader noOpener"><span>Venue</span></h3>
											<div className="formSection">

												<dl className="changeDetails">

													{this.state.eventChanges.newVenue ?
														<React.Fragment>

															{this.state.eventData.venue ?
																<React.Fragment>

																	<dt>Old Venue:</dt>

																	<dd>
																		<span className="old removed">
																			{this.state.eventData.venueName}<br />
																			{this.state.eventData.venueLocation}
																		</span>
																	</dd>

																</React.Fragment>
															: ""}

															<dt>Adding New Venue:</dt>

															<dd>
																<span className="new">
																{this.state.eventChanges.newVenue.name}<br />
																{this.state.eventChanges.newVenue.address1}<br />
																{this.state.eventChanges.newVenue.address2 ?
																	<React.Fragment>
																		{this.state.eventChanges.newVenue.address2}
																		<br />
																	</React.Fragment>
																: ""}
																{this.state.eventChanges.newVenue.location}<br />
																{this.state.eventChanges.newVenue.country}<br />
																</span>
															</dd>

															{this.state.eventChanges.newVenue.link ?
																<React.Fragment>
																	<dt>New Venue Web Site:</dt>
																	<dd><span className="new">
																		{this.state.eventChanges.newVenue.link}
																	</span></dd>
																</React.Fragment>
															: ""}
															{this.state.eventChanges.newVenue.description ?
																<React.Fragment>
																	<dt>New Venue Description:</dt>
																	<dd><span className="new">
																		{this.state.eventChanges.newVenue.description}
																	</span></dd>
																</React.Fragment>
															: ""}
															{this.state.eventChanges.newVenue.timezone ?
																<React.Fragment>
																	<dt>New Venue Time Zone:</dt>
																	<dd><span className="new">
																		{this.state.eventChanges.newVenue.timezone}
																	</span></dd>
																</React.Fragment>
															: ""}

														</React.Fragment>

													: this.state.eventChanges.venue
														&& this.state.eventChanges.venue !== this.state.eventData.venue ?

														<React.Fragment>
															<dt>{!this.state.eventData.id ? "Existing " : ""}Venue:</dt>

															<dd>
																{this.state.eventData.venue ?
																	<React.Fragment>
																		<span className="old removed">
																			{this.state.eventData.venueName}<br />
																			{this.state.eventData.venueLocation}</span>
																			<br />
																	</React.Fragment>
																: ""}
																<span className="new">{this.state.eventChanges.venueName}<br />{this.state.eventChanges.venueLocation}</span><br />
															</dd>

														</React.Fragment>

													:

														<React.Fragment>
															<dt>Venue:</dt>

															<dd>
																<span className="old">{this.state.eventData.venueName}<br />{this.state.eventData.venueLocation}</span>
															</dd>
														</React.Fragment>

													}

												</dl>

											</div>
										</div>

										<div>
											<h3 className="formSectionHeader noOpener"><span>Event Days</span></h3>
											<div className="formSection">

												<dl className="changeDetails">

												{this.state.eventChanges.dayChanges.map((day) => (
													<React.Fragment key={day.id}>

														<dt>
															{day.status === "delete" ?
																<span className="old removed">{day.old.date}</span>
															:
																<CompareValues
																	inline={true}
																	oldValue={day.old.date}
																	newValue={day.new.date}
																/>
															}{day.status === "delete" ? "" :
																day.status === "add" && this.state.eventData.id ? " (new):"
																: ":"}

														</dt>

														<dd>
															{day.status !== "delete" ?
																<React.Fragment>
																<em>Start time:</em>{" "}
																<CompareValues
																	inline={true}
																	oldValue={day.old.start}
																	newValue={day.new.start}
																/><br />

																<em>Doors open:</em>{" "}
																{day.old.doors || day.new.doors ?
																<CompareValues
																	inline={true}
																	oldValue={day.old.doors}
																	newValue={day.new.doors}
																/>
																:
																	<span className="nodata">(none)</span>
																}<br />

																<em>Description:</em><br />
																{day.old.description || day.new.description ?
																	<CompareValues
																		inline={true}
																		oldValue={day.old.description}
																		newValue={day.new.description}
																	/>
																:
																	<span className="nodata">(none)</span>
																}
																</React.Fragment>
															:
																<span className="nodata">(deleted)</span>
															}

														</dd>

													</React.Fragment>
												))}

												</dl>

											</div>
										</div>

										<div>
											<h3 className="formSectionHeader noOpener"><span>Event Features</span></h3>
											<div className="formSection">

											<dl className="changeDetails">

												<dt>Derby types:</dt>
												<dd>
													{this.state.eventChanges.features.derbytypes.map((derbytype) => (
														<React.Fragment key={derbytype.name}>
															{derbytype.status === "add" ?
																<span className="new">{derbytype.name}</span>
															: derbytype.status === "delete" ?
																<span className="old removed">{derbytype.name}</span>
															:
																<span className="old">{derbytype.name}</span>
															}<br />
														</React.Fragment>
													))}
												</dd>

												<dt>Sanctions:</dt>
												<dd>
													{this.state.eventChanges.features.sanctions.map((sanction) => (
														<React.Fragment key={sanction.name}>
															{sanction.status === "add" ?
																<span className="new">{sanction.name}</span>
															: sanction.status === "delete" ?
																<span className="old removed">{sanction.name}</span>
															:
																<span className="old">{sanction.name}</span>
															}<br />
														</React.Fragment>
													))}
												</dd>

												<dt>Tracks:</dt>
												<dd>
													{this.state.eventChanges.features.tracks.map((track) => (
														<React.Fragment key={track.name}>
															{track.status === "add" ?
																<span className="new">{track.name}</span>
															: track.status === "delete" ?
																<span className="old removed">{track.name}</span>
															:
																<span className="old">{track.name}</span>
															}<br />
														</React.Fragment>
													))}
												</dd>

											</dl>

											</div>
										</div>

									</div>

									<div className="buttonRow right">
										<p className="error">{this.state.errorMessage}</p>
										<button type="button" className="largeButton" onClick={this.approveChange}>Approve</button>
										<button type="button" className="largeButton pinkButton" onClick={this.openRejectModal}>Reject</button>
									</div>

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

		axios.post(`${this.props.apiLocation}events/approveChange/${this.props.match.params.changeId}`,
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

	handleInputChange <T extends keyof IReviewEventChangeState>(event: React.ChangeEvent<HTMLTextAreaElement>) {

		const fieldName: (keyof IReviewEventChangeState) = event.currentTarget.name as (keyof IReviewEventChangeState);
		const newState = ({
			[fieldName]: event.currentTarget.value,
		});
		this.setState(newState as { [P in T]: IReviewEventChangeState[P]; });

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

		axios.post(`${this.props.apiLocation}events/rejectChange/${this.props.match.params.changeId}`,
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
		let derbytypesList = [] as IDerbyType[];
		let promiseError = false;
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;
		let sanctionsList = [] as IDerbySanction[];
		let timeZones = [] as ITimeZone[];
		let tracksList = [] as IDerbyTrack[];
		let venueList = [] as IDerbyVenue[];

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

		promises.push(getTimeZones(
			this.props.apiLocation,
			this.props.timeZones,
			this.props.saveTimeZones,
			this.axiosSignal)
			.then((dataResponse: ITimeZone[]) => {
				timeZones = dataResponse;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbySanctions(
			this.props.apiLocation,
			this.props.dataSanctions,
			this.props.saveDataSanctions,
			this.axiosSignal)
			.then((dataResponse: IDerbySanction[]) => {
				sanctionsList = dataResponse;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbyTracks(
			this.props.apiLocation,
			this.props.dataTracks,
			this.props.saveDataTracks,
			this.axiosSignal)
			.then((dataResponse: IDerbyTrack[]) => {
				tracksList = dataResponse;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(getDerbyTypes(
			this.props.apiLocation,
			this.props.dataDerbyTypes,
			this.props.saveDataDerbyTypes,
			this.axiosSignal)
			.then((dataResponse: IDerbyType[]) => {
				derbytypesList = dataResponse;
			}).catch((error) => {
				console.error(error);
				promiseError = true;
			}));

		promises.push(
			axios.get(`${this.props.apiLocation}venues/getAllVenues`,
				{
					cancelToken: this.axiosSignal.token,
					withCredentials: true,
				})
				.then((dataResponse) => {
					venueList = dataResponse.data.map((venue: IDBDerbyVenue) => ({
						city: venue.venue_city,
						country: venue.venue_country,
						id: venue.venue_id,
						name: venue.venue_name,
						region: venue.region_abbreviation,
					}));
				}).catch((error) => {
					console.error(error);
					promiseError = true;
				}));

		Promise.all(promises).then(() => {

			if (!promiseError) {

				axios.get(`${this.props.apiLocation}events/getChange/${this.props.match.params.changeId}`,
					{
						cancelToken: this.axiosSignal.token,
						withCredentials: true,
					})
					.then((result) => {

						const eventResult: IDBDerbyEventChange = result.data;

						const eventData: IDerbyEvent = eventResult.changed_item_id ?
							{
								country: eventResult.country_code,
								days: eventResult.days.map((day) => ({
									date: moment.utc(day.eventday_start_venue).format("MMM D"),
									description: day.eventday_description || undefined,
									doorsTime: day.eventday_doors_venue
										&& day.eventday_doors_venue < day.eventday_start_venue
										? moment.utc(day.eventday_doors_venue).format("h:mm a")
										: undefined,
									id: day.eventday_id,
									startTime: moment.utc(day.eventday_start_venue).format("h:mm a"),
								})),
								description: eventResult.event_description,
								host: eventResult.event_host,
								id: eventResult.event_id,
								link: eventResult.event_link,
								name: eventResult.event_name,
								venue: eventResult.venue_id,
								venueLocation: `${eventResult.venue_city}${eventResult.region_abbreviation ?
									", " + eventResult.region_abbreviation : ""}, ${eventResult.country_code}`,
								venueName: eventResult.venue_name,
							}
						: {} as IDerbyEvent;

						const eventChanges: IDerbyEventChange = {
							changeId: eventResult.change_id,
							dayChanges: [],
							id: eventResult.change_id,
							name: eventResult.event_name,
							submittedDuration: moment.duration(moment(eventResult.change_submitted).diff(moment())).humanize(),
							submittedTime: moment(eventResult.change_submitted).format("MMM D, Y h:mm a"),
							user: eventResult.change_user,
							username: eventResult.change_user_name,
						};

						if (eventResult.change_object) {

							const changeObject: IDerbyEventChangeObject = JSON.parse(eventResult.change_object);

							// Basic Info

							for (const field of changeObject.data) {

								const fieldName: (keyof IDerbyEventChange) = field.field as (keyof IDerbyEventChange);
								eventChanges[fieldName] = field.value;

							}

							// Venue

							if (changeObject.newVenueData) {

								const newVenue: INewDerbyVenue = {} as INewDerbyVenue;

								for (const key in changeObject.newVenueData) {
									if (changeObject.newVenueData.hasOwnProperty(key)) {

										switch (key) {

											case "country":
												newVenue[key] = countryList.filter(
													(country) => country.country_code === changeObject.newVenueData[key])[0].country_name;
												break;

											case "region":
												if (changeObject.newVenueData[key] ) {
													newVenue[key] = regionLists[changeObject.newVenueData.country || eventData.country].filter(
														(region) => region.region_id === changeObject.newVenueData[key])[0].region_abbreviation;
												}
												break;

											case "timezone":
												newVenue[key] = timeZones.filter(
													(tz) => tz.timezone_id === changeObject.newVenueData[key])[0].timezone_name;
												break;

											case "address1":
											case "address2":
											case "city":
											case "description":
											case "link":
											case "postcode":
											case "name":

												newVenue[key] = changeObject.newVenueData[key];
												break;

										}

										newVenue.location = `${newVenue.city}${newVenue.region ?
											", " + newVenue.region : ""}${newVenue.postcode ?
											", " + newVenue.postcode : ""}`;

										eventChanges.newVenue = newVenue;

									}
								}

							} else if (eventChanges.venue) {

								const venueObject = venueList.filter(
									(venue) => venue.id === eventChanges.venue)[0];

								eventChanges.venueName = venueObject.name;
								eventChanges.venueLocation = `${venueObject.city}${venueObject.region ?
									", " + venueObject.region : ""}, ${venueObject.country}`;

							}

							// Event Days

							if (eventData.days) {

								for (const day of eventData.days) {

									const dayData = {
										id: day.id,
										new: {},
										old: {
											date: day.date,
											description: day.description,
											doors: day.doorsTime,
											start: day.startTime,
										},
										startDate: moment.utc(day.dateObject).format("Y-MM-DD"),
										status: "unchanged",
									};

									const newDay = changeObject.days.filter((d) => d.id === day.id);

									if (newDay.length) {
										dayData.status = newDay[0].operation;
										if (newDay[0].operation === "change") {
											dayData.new = {
												date: typeof newDay[0].value.datetime !== "undefined"
													? moment.utc(newDay[0].value.datetime).format("MMM D, Y")
													: undefined,
												description: typeof newDay[0].value.description !== "undefined"
													? newDay[0].value.description
													: undefined,
												doors: typeof newDay[0].value.doors === "undefined"
													? undefined
													: newDay[0].value.doors !== null ?
														moment.utc(newDay[0].value.doors).format("h:mm a")
														: null,
												start: typeof newDay[0].value.datetime !== "undefined"
													? moment.utc(newDay[0].value.datetime).format("h:mm a")
													: undefined,
											};
										}
									}

									eventChanges.dayChanges.push(dayData);

								}

							}

							let iterator = -1;

							for (const day of changeObject.days.filter((d) => d.operation === "add")) {

								eventChanges.dayChanges.push({
									id: iterator,
									new: {
										date: moment.utc(day.value.datetime).format("MMM D, Y"),
										description: day.value.description,
										doors: day.value.doors ?
											moment.utc(day.value.doors).format("h:mm a")
											: undefined,
										start: moment.utc(day.value.datetime).format("h:mm a"),
									},
									old: {},
									startDate: moment.utc(day.value.datetime).format("Y-MM-DD"),
									status: "add",
								});

								iterator --;

							}

							eventChanges.dayChanges.sort((a, b) =>
									a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0);

							// features

							const features = {
								derbytypes: [] as Array<{name: string, status: string}>,
								sanctions: [] as Array<{name: string, status: string}>,
								tracks: [] as Array<{name: string, status: string}>,
							};

							if (eventResult.derbytypes) {
								features.derbytypes =
									derbytypesList
										.filter((dt: IDerbyType) => eventResult.derbytypes.split(",").indexOf(dt.derbytype_id.toString()) > -1 )
										.map((dt: IDerbyType) => ({
											name: dt.derbytype_name,
											status: changeObject.features.delete.indexOf(`derbytype-${dt.derbytype_id}`) > -1 ?  "delete" : "unchanged",
										}));
							}

							if (eventResult.sanctions) {
								features.sanctions =
									sanctionsList
										.filter((s: IDerbySanction) => eventResult.sanctions.split(",").indexOf(s.sanction_id.toString()) > -1 )
										.map((s: IDerbySanction) => ({
											name: s.sanction_name,
											status: changeObject.features.delete.indexOf(`sanction-${s.sanction_id}`) > -1 ?  "delete" : "unchanged",
										}));
							}

							if (eventResult.tracks) {
								features.tracks =
									tracksList
										.filter((t: IDerbyTrack) => eventResult.tracks.split(",").indexOf(t.track_id.toString()) > -1 )
										.map((t: IDerbyTrack) => ({
											name: t.track_name,
											status: changeObject.features.delete.indexOf(`track-${t.track_id}`) > -1 ?  "delete" : "unchanged",
										}));
							}

							for (const feature of changeObject.features.add) {
								const featureItem = feature.split("-");

								switch (featureItem[0]) {

									case "derbytype":
										features.derbytypes.push({
											name: derbytypesList
												.filter((dt: IDerbyType) => dt.derbytype_id.toString() === featureItem[1])[0].derbytype_name,
											status: "add",
										});
										break;

									case "sanction":
										features.sanctions.push({
											name: sanctionsList
												.filter((s: IDerbySanction) => s.sanction_id.toString() === featureItem[1])[0].sanction_name,
											status: "add",
										});
										break;

									case "track":
										features.tracks.push({
											name: tracksList
												.filter((t: IDerbyTrack) => t.track_id.toString() === featureItem[1])[0].track_name,
											status: "add",
										});
										break;

								}
							}

							features.derbytypes.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
							features.sanctions.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
							features.tracks.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

							eventChanges.features = features;

							this.setState({
								eventChanges,
								eventData,
								initialLoad: true,
								loading: false,
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
