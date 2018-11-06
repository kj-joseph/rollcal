import React from "react";
import { Link } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import { IDBDerbyEvent, IDBDerbyVenue,
	IDerbyEvent, IDerbyEventDayFormatted,
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

				<div className="dashboard reviewEventChange">

					<h1>Review Event Change</h1>

					{this.state.loading ?

						<div className="loader" />

					: this.state.status === "approved" ?

						<p>Approval was successful.  The submitting user will receive an email.</p>

					: this.state.status === "rejected" ?

						<p>Rejection was successful.  The submitting user will receive an email.</p>

					:

					<React.Fragment>

						<div className="callout">
							<p className="header">KEY TO CHANGES</p>
							<p>
								<span className="old">Existing data</span>{" / "}
								<span className="removed">Replaced data</span>{" / "}
								<span className="new">New data</span>
							</p>
						</div>

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

													<dt>Name:</dt>

													<dd>
														<span className={`old${this.state.eventChanges.name !== this.state.eventData.name ? " removed" : ""}`}>
															{this.state.eventData.name}
														</span>
														{this.state.eventChanges.name && this.state.eventChanges.name !== this.state.eventData.name ?
															<React.Fragment>
																{this.state.eventData.name ? " " : ""}
																<span className="new">{this.state.eventChanges.name}</span>
															</React.Fragment>
														: ""}
													</dd>

													<dt>Address:</dt>

													<dd>

														<span className={`old${this.state.eventChanges.address1 !== this.state.eventData.address1 ? " removed" : ""}`}>
															{this.state.eventData.address1}
														</span>
														{this.state.eventChanges.address1 && this.state.eventChanges.address1 !== this.state.eventData.address1 ?
															<React.Fragment>
																{this.state.eventData.address1 ? " " : ""}
																<span className="new">{this.state.eventChanges.address1}</span>
															</React.Fragment>
														: ""}

														{this.state.eventData.address2 || this.state.eventChanges.address2 ?
															<React.Fragment>
																<br />
																<span className={`old${this.state.eventChanges.address2 !== this.state.eventData.address2 ? " removed" : ""}`}>
																	{this.state.eventData.address2}
																</span>
																{this.state.eventChanges.address2 && this.state.eventChanges.address2 !== this.state.eventData.address2 ?
																	<React.Fragment>
																		{this.state.eventData.address2 ? " " : ""}
																		<span className="new">{this.state.eventChanges.address2}</span>
																	</React.Fragment>
																: ""}
															</React.Fragment>
														: ""}

														<br />

														<span className={`old${this.state.eventChanges.city !== this.state.eventData.city ? " removed" : ""}`}>
															{this.state.eventData.city}
														</span>
														{this.state.eventChanges.city && this.state.eventChanges.city !== this.state.eventData.city ?
															<React.Fragment>
																{this.state.eventData.city ? " " : ""}
																<span className="new">{this.state.eventChanges.city}</span>
															</React.Fragment>
														: ""}

														{this.state.eventData.region || this.state.eventChanges.region ?
															<React.Fragment>
																{", "}

																<span className={`old${this.state.eventChanges.region !== this.state.eventData.region ? " removed" : ""}`}>
																	{this.state.eventData.region}
																</span>
																{this.state.eventChanges.region && this.state.eventChanges.region !== this.state.eventData.region ?
																	<React.Fragment>
																		{this.state.eventData.region ? " " : ""}
																		<span className="new">{this.state.eventChanges.region}</span>
																	</React.Fragment>
																: ""}

															</React.Fragment>
														: ""}

														{this.state.eventData.postcode || this.state.eventChanges.postcode ?
															<React.Fragment>
																{" "}

																<span className={`old${this.state.eventChanges.postcode !== this.state.eventData.postcode ? " removed" : ""}`}>
																	{this.state.eventData.postcode}
																</span>
																{this.state.eventChanges.postcode && this.state.eventChanges.postcode !== this.state.eventData.postcode ?
																	<React.Fragment>
																		{this.state.eventData.postcode ? " " : ""}
																		<span className="new">{this.state.eventChanges.postcode}</span>
																	</React.Fragment>
																: ""}

															</React.Fragment>
														: ""}

														<br />

														<span className={`old${this.state.eventChanges.country !== this.state.eventData.country ? " removed" : ""}`}>
															{this.state.eventData.country}
														</span>
														{this.state.eventChanges.country && this.state.eventChanges.country !== this.state.eventData.country ?
															<React.Fragment>
																{this.state.eventData.country ? " " : ""}
																<span className="new">{this.state.eventChanges.country}</span>
															</React.Fragment>
														: ""}

													</dd>

													<dt>Link:</dt>

													<dd>
														{this.state.eventData.link || this.state.eventChanges.link ?
															<React.Fragment>
																<span className={`old${this.state.eventChanges.link !== this.state.eventData.link ? " removed" : ""}`}>
																	{this.state.eventData.link}
																</span>
																{this.state.eventChanges.link && this.state.eventChanges.link !== this.state.eventData.link ?
																	<React.Fragment>
																		{this.state.eventData.link ? " " : ""}
																		<span className="new">{this.state.eventChanges.link}</span>
																	</React.Fragment>
																: ""}
															</React.Fragment>
														:
															<span className="nodata">(none)</span>
														}
													</dd>


													<dt>Description:</dt>

													<dd>
														{this.state.eventData.description || this.state.eventChanges.description ?
															<React.Fragment>
																<span className={`old${this.state.eventChanges.description !== this.state.eventData.description ? " removed" : ""}`}>
																	{this.state.eventData.description}
																</span>
																{this.state.eventChanges.description && this.state.eventChanges.description !== this.state.eventData.description ?
																	<React.Fragment>
																		{this.state.eventData.description ? " " : ""}
																		<span className="new">{this.state.eventChanges.description}</span>
																	</React.Fragment>
																: ""}
															</React.Fragment>
														:
															<span className="nodata">(none)</span>
														}
													</dd>


													<dt>Time Zone:</dt>

													<dd>
														<span className={`old${this.state.eventChanges.timezone !== this.state.eventData.timezone ? " removed" : ""}`}>
															{this.state.eventData.timezone}
														</span>
														{this.state.eventChanges.timezone && this.state.eventChanges.timezone !== this.state.eventData.timezone ?
															<React.Fragment>
																{this.state.eventData.timezone ? " " : ""}
																<span className="new">{this.state.eventChanges.timezone}</span>
															</React.Fragment>
														: ""}
													</dd>

												</dl>

											</div>
										</div>

										<div>
											<h3 className="formSectionHeader noOpener"><span>Event Days</span></h3>
											<div className="formSection">

											</div>
										</div>

										<div>
											<h3 className="formSectionHeader noOpener"><span>Event Features</span></h3>
											<div className="formSection">

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
		const promises: Array<Promise<any>> = [];
		let regionLists = {} as IGeoRegionList;
		let timeZones = [] as ITimeZone[];
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

		promises.push(
			axios.get(`${this.props.apiLocation}venues/getAllVenues`, { withCredentials: true })
				.then((dataResponse: AxiosResponse) => {
				venueList = dataResponse.data;
			}).catch((err: ErrorEventHandler) => {
				console.error(err);
			}));

		Promise.all(promises).then(() => {
			console.log(venueList);

			axios.get(`${this.props.apiLocation}events/getChange/${this.props.match.params.changeId}`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					const eventData = result.data.changed_item_id ?
						{
							country: result.data.country_code,
							description: result.data.event_description,
							host: result.data.event_host,
							link: result.data.event_link,
							name: result.data.event_name,
							venue: result.data.venue_name,
							venuelocation: `${result.data.venue_city}${result.data.region_abbreviation ?
								", " + result.data.region_abbreviation : ""}, ${result.data.country_code}`,
						}
					: {};

					const eventChanges: {[key: string]: any} = {
						changeId: result.data.change_id,
						submittedDuration: moment.duration(moment(result.data.change_submitted).diff(moment())).humanize(),
						submittedTime: moment(result.data.change_submitted).format("MMM D, Y h:mm a"),
						user: result.data.change_user,
						username: result.data.change_user_name,
					};

					if (result.data.change_object) {

						const changeObject = JSON.parse(result.data.change_object);

						for (const field of changeObject.data) {
							eventChanges[field.field] = field.value;
						}

						if (changeObject.newVenueData) {

							for (const key in changeObject.newVenueData) {
								if (changeObject.newVenueData.hasOwnProperty(key)) {

									switch (key) {

										case "country":
											eventChanges[key] = countryList.filter(
												(country: IGeoCountry) => country.country_code === changeObject.newVenueData[key])[0].country_name;
											break;

										case "region":
											eventChanges[key] = regionLists[changeObject.newVenueData.country || eventData.country].filter(
												(region: IGeoRegion) => region.region_id === changeObject.newVenueData[key])[0].region_abbreviation;
											break;

										case "timezone":
											eventChanges[key] = timeZones.filter(
												(tz: ITimeZone) => tz.timezone_id === changeObject.newVenueData[key])[0].timezone_name;
											break;

										default:

											eventChanges[key] = changeObject.newVenueData[key];
											break;

									}

									eventChanges.newVenue = true;
									eventChanges.venuelocation = `${result.data.venue_city}${result.data.region_abbreviation ?
										", " + result.data.region_abbreviation : ""}, ${result.data.country_code}`;

								}
							}

						} else {

							// new venue

						}

						console.log(eventData, eventChanges);

						this.setState({
							eventChanges,
							eventData,
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
