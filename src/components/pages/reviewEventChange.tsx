import React from "react";
import { Link } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import { IDBDerbyVenue,
	IDerbySanction, IDerbyTrack, IDerbyType,
	IDerbyVenue,
	IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList, ITimeZone,
	} from "components/interfaces";

import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography, getTimeZones } from "components/lib/data";

import CompareValues from "components/partials/compareValues";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

export default class ReviewEventChange<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			errorMessage: null,
			eventChanges: {},
			eventData: {},
			initialLoad: false,
			loading: true,
			modalOpen: false,
			path: "",
			rejectComment: "",
			status: null,
			userId: null,
		};

		this.approveChange = this.approveChange.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.openRejectModal = this.openRejectModal.bind(this);
		this.rejectChange = this.rejectChange.bind(this);

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
					<Link to="/dashboard/events/changes">
						&laquo; Back to event changes
					</Link>
				</p>

				<div className={`dashboard reviewEventChange ${this.state.eventData.eventId ? "" : "newEvent"}`}>

					<h1>{this.state.initialLoad ? `Review ${this.state.eventData.eventId ? "Event Change" : "New Event"}` : ""}</h1>

					{this.state.loading ?

						<div className="loader" />

					: this.state.status === "approved" ?

						<p>Approval was successful.  The submitting user will receive an email.</p>

					: this.state.status === "rejected" ?

						<p>Rejection was successful.  The submitting user will receive an email.</p>

					:

					<React.Fragment>

						{this.state.eventData.eventId ?
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
															<dt>{!this.state.eventData.eventId ? "Existing " : ""}Venue:</dt>

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

												{this.state.eventChanges.days.map((day: {[key: string]: any}) => (
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
																day.status === "add" && this.state.eventData.eventId ? " (new):"
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
													{this.state.eventChanges.features.derbytypes.map((dt: {name: string, status: string}) => (
														<React.Fragment key={dt.name}>
															{dt.status === "add" ?
																<span className="new">{dt.name}</span>
															: dt.status === "delete" ?
																<span className="old removed">{dt.name}</span>
															:
																<span className="old">{dt.name}</span>
															}<br />
														</React.Fragment>
													))}
												</dd>

												<dt>Sanctions:</dt>
												<dd>
													{this.state.eventChanges.features.sanctions.map((s: {name: string, status: string}) => (
														<React.Fragment key={s.name}>
															{s.status === "add" ?
																<span className="new">{s.name}</span>
															: s.status === "delete" ?
																<span className="old removed">{s.name}</span>
															:
																<span className="old">{s.name}</span>
															}<br />
														</React.Fragment>
													))}
												</dd>

												<dt>Tracks:</dt>
												<dd>
													{this.state.eventChanges.features.tracks.map((t: {name: string, status: string}) => (
														<React.Fragment key={t.name}>
															{t.status === "add" ?
																<span className="new">{t.name}</span>
															: t.status === "delete" ?
																<span className="old removed">{t.name}</span>
															:
																<span className="old">{t.name}</span>
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
			{ withCredentials: true })
			.then((result: AxiosResponse) => {

				this.setState({
					loading: false,
					status: "approved",
				});

			}).catch((error: AxiosError) => {

				console.error(error);
				this.setState({
					errorMessage: "Something went wrong.  Please reload the page and try again.",
					loading: false,
				});

			});

	}

	closeModal() {

		this.setState({
			modalOpen: false,
			rejectComment: "",
		});

	}

	handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {

		this.setState({
			[event.currentTarget.name]: event.currentTarget.value,
		});

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
			{ withCredentials: true })
			.then((result: AxiosResponse) => {

				this.setState({
					loading: false,
					status: "rejected",
				});

			}).catch((error: AxiosError) => {

				console.error(error);
				this.setState({
					errorMessage: "Something went wrong.  Please reload the page and try again.",
					loading: false,
				});

			});

	}

	loadData() {

		this.setState({
			eventData: [],
			loading: true,
		});

		let countryList = [] as IGeoCountry[];
		let derbytypesList = [] as IDerbyType[];
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;
		let sanctionsList = [] as IDerbySanction[];
		let timeZones = [] as ITimeZone[];
		let tracksList = [] as IDerbyTrack[];
		let venueList = [] as IDerbyVenue[];

		promises.push(getGeography(this.props)
			.then((dataResponse: IGeoData) => {
				countryList = dataResponse.countries;
				regionLists = dataResponse.regions;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getTimeZones(this.props)
			.then((dataResponse: ITimeZone[]) => {
				timeZones = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTypes(this.props)
			.then((dataResponse: IDerbyType[]) => {
				derbytypesList = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbySanctions(this.props)
			.then((dataResponse: IDerbySanction[]) => {
				sanctionsList = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(getDerbyTracks(this.props)
			.then((dataResponse: IDerbyTrack[]) => {
				tracksList = dataResponse;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		promises.push(
			axios.get(`${this.props.apiLocation}venues/getAllVenues`, { withCredentials: true })
				.then((dataResponse: AxiosResponse) => {
				venueList = dataResponse.data.map((venue: IDBDerbyVenue) => ({
					city: venue.venue_city,
					country: venue.venue_country,
					id: venue.venue_id,
					name: venue.venue_name,
					region: venue.region_abbreviation,
				}));
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		Promise.all(promises).then(() => {

			axios.get(`${this.props.apiLocation}events/getChange/${this.props.match.params.changeId}`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					const eventData = result.data.changed_item_id ?
						{
							country: result.data.country_code,
							days: result.data.days,
							description: result.data.event_description,
							eventId: result.data.event_id,
							host: result.data.event_host,
							link: result.data.event_link,
							name: result.data.event_name,
							venue: result.data.venue_id,
							venueLocation: `${result.data.venue_city}${result.data.region_abbreviation ?
								", " + result.data.region_abbreviation : ""}, ${result.data.country_code}`,
							venueName: result.data.venue_name,
						}
					: {};

					const eventChanges: {[key: string]: any} = {
						changeId: result.data.change_id,
						days: [],
						submittedDuration: moment.duration(moment(result.data.change_submitted).diff(moment())).humanize(),
						submittedTime: moment(result.data.change_submitted).format("MMM D, Y h:mm a"),
						user: result.data.change_user,
						username: result.data.change_user_name,
					};

					if (result.data.change_object) {

						const changeObject = JSON.parse(result.data.change_object);

						// Basic Info

						for (const field of changeObject.data) {
							eventChanges[field.field] = field.value;
						}

						// Venue

						if (changeObject.newVenueData) {

							const newVenue: {[key: string]: any} = {};

							for (const key in changeObject.newVenueData) {
								if (changeObject.newVenueData.hasOwnProperty(key)) {

									switch (key) {

										case "country":
											newVenue[key] = countryList.filter(
												(country: IGeoCountry) => country.country_code === changeObject.newVenueData[key])[0].country_name;
											break;

										case "region":
											newVenue[key] = regionLists[changeObject.newVenueData.country || eventData.country].filter(
												(region: IGeoRegion) => region.region_id === changeObject.newVenueData[key])[0].region_abbreviation;
											break;

										case "timezone":
											newVenue[key] = timeZones.filter(
												(tz: ITimeZone) => tz.timezone_id === changeObject.newVenueData[key])[0].timezone_name;
											break;

										default:

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
								(venue: IDerbyVenue) => venue.id === eventChanges.venue)[0];

							eventChanges.venueName = venueObject.name;
							eventChanges.venueLocation = `${venueObject.city}${venueObject.region ?
								", " + venueObject.region : ""}, ${venueObject.country}`;

						}

						// Event Days

						if (eventData.days) {

							for (const day of eventData.days) {

								const dayData = {
									id: day.eventday_id,
									new: {},
									old: {
										date: moment.utc(day.eventday_start_venue).format("MMM D, Y"),
										description: day.eventday_description,
										doors: day.eventday_doors_venue ?
											moment.utc(day.eventday_doors_venue).format("h:mm a")
											: undefined,
										start: moment.utc(day.eventday_start_venue).format("h:mm a"),
									},
									startDate: moment.utc(day.eventday_start_venue).format("Y-MM-DD"),
									status: "unchanged",
								};

								const newDay = changeObject.days.filter((d: {[key: string]: any}) => d.id === day.eventday_id);

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

								eventChanges.days.push(dayData);

							}

						}

						let iterator = -1;

						for (const day of changeObject.days.filter((d: {[key: string]: any}) => d.operation === "add")) {

							eventChanges.days.push({
								id: iterator,
								new: {
									date: moment.utc(day.value.datetime).format("MMM D, Y"),
									description: day.description,
									doors: day.doors ?
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

						eventChanges.days.sort((a: {[key: string]: any}, b: {[key: string]: any}) =>
								a.startDate > b.startDate ? 1 : a.startDate < b.startDate ? -1 : 0);

						// features

						const features = {
							derbytypes: [] as Array<{name: string, status: string}>,
							sanctions: [] as Array<{name: string, status: string}>,
							tracks: [] as Array<{name: string, status: string}>,
						};

						if (result.data.derbytypes) {
							features.derbytypes =
								derbytypesList
									.filter((dt: IDerbyType) => result.data.derbytypes.split(",").indexOf(dt.derbytype_id.toString()) > -1 )
									.map((dt: IDerbyType) => ({
										name: dt.derbytype_name,
										status: changeObject.features.delete.indexOf(`derbytype-${dt.derbytype_id}`) > -1 ?  "delete" : "unchanged",
									}));
						}

						if (result.data.sanctions) {
							features.sanctions =
								sanctionsList
									.filter((s: IDerbySanction) => result.data.sanctions.split(",").indexOf(s.sanction_id.toString()) > -1 )
									.map((s: IDerbySanction) => ({
										name: s.sanction_name,
										status: changeObject.features.delete.indexOf(`sanction-${s.sanction_id}`) > -1 ?  "delete" : "unchanged",
									}));
						}

						if (result.data.tracks) {
							features.tracks =
								tracksList
									.filter((t: IDerbyTrack) => result.data.tracks.split(",").indexOf(t.track_id.toString()) > -1 )
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

				}).catch((error: AxiosError) => {
					console.error(error);

					this.setState({
						dataError: true,
						loading: false,
					});

				});

		});

	}

}
