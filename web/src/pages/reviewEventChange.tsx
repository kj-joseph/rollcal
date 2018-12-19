import RCComponent from "components/rcComponent";
import React from "react";
import FormatText from "react-format-text";
import { Link } from "react-router-dom";

import moment from "moment";

import { IDerbyEvent, IDerbyEventChange, IDerbyEventChangeObjectDayChange } from "interfaces/event";
import { IDerbyFeatureChange, IDerbyFeatureChanges, IDerbyFeatureType } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IDerbyVenue } from "interfaces/venue";

import { approveEventChange, getEventChange, rejectEventChange } from "services/eventChangeService";
import { findFeatureByString, getFeatures, mapFeaturesToArrays } from "services/featureService";
import { getGeography } from "services/geoService";
import { getTimeZones } from "services/timeService";
import { checkUserRole } from "services/userService";
import { buildVenueLocation, getVenueDetails } from "services/venueService";

import CompareValues from "components/compareValues";
import FormSection from "components/formSection";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

interface IReviewEventChangeState {
	dataError: boolean;
	errorMessage: string;
	eventChanges: IDerbyEventChange;
	eventData: IDerbyEvent;
	featureTypes: string[];
	initialLoad: boolean;
	loading: boolean;
	modalOpen: boolean;
	path: string;
	rejectComment: string;
	status: null | "approved" | "rejected";
	userId: number;
}

export default class ReviewEventChange extends RCComponent<IProps> {

	state: IReviewEventChangeState = {
		dataError: false,
		errorMessage: null,
		eventChanges: {} as IDerbyEventChange,
		eventData: {} as IDerbyEvent,
		featureTypes: [],
		initialLoad: false,
		loading: true,
		modalOpen: false,
		path: null,
		rejectComment: "",
		status: null,
		userId: null,
	};

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

		if (!this.props.loggedIn || !checkUserRole("user")) {

			this.props.history.push("/");

		} else if (!checkUserRole("reviewer")) {

			this.props.history.push("/dashboard");

		} else if (window.location.pathname !== this.state.path
			|| this.props.user.id !== this.state.userId ) {

			this.setState({
				path: window.location.pathname,
				userId: this.props.user.id,
			});

			if (this.props.user.id) {
				this.loadData();
			}

		}

	}

	render() {

		return (

			<>

				<p className="backToLink">
					<Link to="/dashboard/events/changes">
						&laquo; Back to event changes
					</Link>
				</p>

				<div className={`dashboard reviewEventChange ${this.state.eventData.id ? "" : "newEvent"}`}>

					<h1>
						{this.state.initialLoad ?
							`Review ${this.state.eventData.id ?
								"Event Change"
							: "New Event"}`
						: null}
					</h1>

					{this.state.loading ?

						<div className="loader" />

					: this.state.status === "approved" ?

						<p>Approval was successful.  The submitting user will receive an email.</p>

					: this.state.status === "rejected" ?

						<p>Rejection was successful.  The submitting user will receive an email.</p>

					:

					<>

						{this.state.eventData.id ?
							<div className="callout">
								<p className="header">KEY TO CHANGES</p>
								<p>
									<span className="old">Unchanged data</span>{" / "}
									<span className="removed">Replaced data</span>{" / "}
									<span className="new">New data</span>
								</p>
							</div>
						: null}

						{this.state.eventChanges.changeId ?

							<>

								<div className="entryForm">
									<div className="formContainer">

										<FormSection label="Basic Event Information">

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
													addFormatting={true}
													label="Description"
													oldValue={this.state.eventData.description}
													newValue={this.state.eventChanges.description}
												/>

											</dl>

										</FormSection>

										<FormSection label="Venue">

											<dl className="changeDetails">

												{this.state.eventChanges.newVenue ?
													<>

														{this.state.eventData.venue && this.state.eventData.venue.id ?
															<>

																<dt>Old Venue:</dt>

																<dd>
																	<span className="old removed">
																		{this.state.eventData.venue.name}<br />
																		{buildVenueLocation(this.state.eventData.venue)}
																	</span>
																</dd>

															</>
														: null}

														<dt>Adding New Venue:</dt>

														<dd>
															<span className="new">
																{this.state.eventChanges.newVenue.name}<br />
																{this.state.eventChanges.newVenue.address1}<br />
																{this.state.eventChanges.newVenue.address2 ?
																	<>
																		{this.state.eventChanges.newVenue.address2}
																		<br />
																	</>
																: null}
																{buildVenueLocation(this.state.eventChanges.newVenue)}<br />
																{this.state.eventChanges.newVenue.country.name}<br />
															</span>
														</dd>

														{this.state.eventChanges.newVenue.link ?
															<>
																<dt>New Venue Web Site:</dt>
																<dd><span className="new">
																	{this.state.eventChanges.newVenue.link}
																</span></dd>
															</>
														: null}

														{this.state.eventChanges.newVenue.description ?
															<>
																<dt>New Venue Description:</dt>
																<dd><span className="new">
																	<FormatText>{this.state.eventChanges.newVenue.description}</FormatText>
																</span></dd>
															</>
														: null}

														{this.state.eventChanges.newVenue.timezone ?
															<>
																<dt>New Venue Time Zone:</dt>
																<dd><span className="new">
																	{this.state.eventChanges.newVenue.timezone.name}
																</span></dd>
															</>
														: null}

													</>

												: this.state.eventChanges.venue
													&& this.state.eventChanges.venue !== this.state.eventData.venue ?

													<>
														<dt>
															{!this.state.eventData.id ?
																"Existing "
															: null}
															Venue:
														</dt>

														<dd>
															{this.state.eventData.venue && this.state.eventData.venue.id ?

																<>
																	<span className="old removed">
																		{this.state.eventData.venue.name}<br />
																		{buildVenueLocation(this.state.eventData.venue)}
																	</span><br />
																</>

															: null}

															<span className="new">
																{this.state.eventChanges.venue.name}<br />
																{buildVenueLocation(this.state.eventChanges.venue)}
															</span><br />

														</dd>

													</>

												:

													<>
														<dt>Venue:</dt>

														<dd>
															<span className="old">
																{this.state.eventData.venue.name}<br />
																{buildVenueLocation(this.state.eventData.venue)}
															</span>
														</dd>
													</>

												}

											</dl>

										</FormSection>

										<FormSection label="Event Days">

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
															<>
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
																		addFormatting={true}
																		inline={true}
																		oldValue={day.old.description}
																		newValue={day.new.description}
																	/>
																:
																	<span className="nodata">(none)</span>
																}
															</>
														:
															<span className="nodata">(deleted)</span>
														}

													</dd>

												</React.Fragment>
											))}

											</dl>

										</FormSection>

										<FormSection label="Event Features">

											<dl className="changeDetails">

												{Object.keys(this.state.eventChanges.featureChanges)
													.map((type) => (

														<React.Fragment key={type}>
															<dt>
																{this.state.eventChanges.featureChanges[type].name}
															</dt>

															<dd>
																{this.state.eventChanges.featureChanges[type].features
																	.map((feature) => (
																		<React.Fragment key={feature.name}>
																			{feature.status === "add" ?
																				<span className="new">{feature.name}</span>
																			: feature.status === "delete" ?
																				<span className="old removed">{feature.name}</span>
																			:
																				<span className="old">{feature.name}</span>
																			}<br />
																		</React.Fragment>
																	))}

															</dd>
														</React.Fragment>

												))}

											</dl>

										</FormSection>

									</div>

									<div className="buttonRow right">
										<p className="error">{this.state.errorMessage}</p>
										<button type="button" className="largeButton" onClick={this.approveChange}>Approve</button>
										<button type="button" className="largeButton pinkButton" onClick={this.openRejectModal}>Reject</button>
									</div>

								</div>

							</>

						:

							<p>There was an error.</p>

						}


					</>

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

			</>

		);

	}

	approveChange(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.setState({
			loading: true,
		});

		const approval = this.addPromise(
			approveEventChange(this.props.match.params.changeId));

		approval
			.then(() => {

				this.setState({
					loading: false,
					status: "approved",
				});

			}).catch((error) => {

				console.error(error);
				this.setState({
					errorMessage: "Something went wrong.  Please reload the page and try again.",
					loading: false,
				});

			})
			.finally(approval.clear);

	}

	closeModal(): void {

		this.setState({
			modalOpen: false,
			rejectComment: "",
		});

	}

	handleInputChange <T extends keyof IReviewEventChangeState>(event: React.ChangeEvent<HTMLTextAreaElement>): void {

		const fieldName: (keyof IReviewEventChangeState) = event.currentTarget.name as (keyof IReviewEventChangeState);
		const newState = ({
			[fieldName]: event.currentTarget.value,
		});
		this.setState(newState as { [P in T]: IReviewEventChangeState[P]; });

	}

	openRejectModal(event: React.MouseEvent<HTMLButtonElement>): void {

		event.preventDefault();

		this.setState({
			modalOpen: true,
		});

	}

	rejectChange(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>): void {

		event.preventDefault();

		this.setState({
			loading: true,
			modalOpen: false,
		});

		const rejection = this.addPromise(
			rejectEventChange(this.props.match.params.changeId, this.state.rejectComment));

		rejection
			.then(() => {

				this.setState({
					loading: false,
					status: "rejected",
				});

			}).catch((error) => {

				console.error(error);
				this.setState({
					errorMessage: "Something went wrong.  Please reload the page and try again.",
					loading: false,
				});

			})
			.finally(rejection.clear);

	}

	loadData(): void {

		this.setState({
			loading: true,
		});

		const loadData = this.addPromise(
			Promise.all([
				getGeography(),
				getTimeZones(),
				getFeatures(),
			]));

		loadData
			.then((data: [
					IGeoCountry[],
					ITimeZone[],
					IDerbyFeatureType[]
				]) => {

				const [countryList, timeZones, featuresLists] = data;

				const loadChange = this.addPromise(
					getEventChange(this.props.match.params.changeId));

				loadChange
					.then((eventData: IDerbyEventChange) => {

						const eventChanges = Object.assign({}, eventData);

						let venuePromise: Array<Promise<any>> = [];

						if (eventData.changeObject) {

							const changeObject = eventData.changeObject;

							// Basic Info

							for (const field of changeObject.data) {

								const fieldName: (keyof IDerbyEventChange) = field.field as (keyof IDerbyEventChange);

								if (fieldName === "venue" && !changeObject.newVenueData) {

									// Venue change to be handled in later code
									venuePromise = [getVenueDetails(field.value)];

								} else {

									eventChanges[fieldName] = field.value;

								}

							}

							// Venue

							if (changeObject.newVenueData) {

								eventChanges.newVenue = {} as IDerbyVenue;

								for (const key in changeObject.newVenueData) {
									if (changeObject.newVenueData.hasOwnProperty(key)) {

										switch (key) {

											case "country":
												eventChanges.newVenue.country = countryList
													.filter((country) =>
														country.code === changeObject.newVenueData.country)[0];

												break;

											case "region":
												if (changeObject.newVenueData.region) {

													const countryObject = countryList
														.filter((country) =>
															country.code === (changeObject.newVenueData.country || eventData.venue.country))[0];

													if (countryObject && countryObject.regions && countryObject.regions.length) {

														const regionObject = countryObject.regions
															.filter((region) =>
																region.id === changeObject.newVenueData.region)[0];

														if (regionObject && regionObject.id) {

															eventChanges.newVenue.region = regionObject;

														}

													}

												}

												break;

											case "timezone":
												eventChanges.newVenue.timezone = timeZones.filter(
													(tz: ITimeZone) =>
														tz.id === changeObject.newVenueData.timezone)[0];
												break;

											case "address1":
											case "address2":
											case "city":
											case "description":
											case "link":
											case "postcode":
											case "name":

												eventChanges.newVenue[key] = changeObject.newVenueData[key];

												break;

										}

									}
								}

							}

							// Event Days

							eventChanges.dayChanges = [];

							if (eventData.days) {

								for (const day of eventData.days) {

									const dayData: IDerbyEventChangeObjectDayChange = {
										id: day.id,
										new: {},
										old: {
											date: day.date,
											description: day.description,
											doors: day.doorsTime,
											start: day.startTime,
										},
										startDate: moment(day.dateObject).format("Y-MM-DD"),
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

							const featureChanges: IDerbyFeatureChanges = {};
							const featureTypes = featuresLists
								.map((feature) =>
									feature.code);

							if (eventData.features
								&& eventData.features.length) {

								const featureArrays = mapFeaturesToArrays(eventData.features);

								for (const type of featureTypes) {
									if (featureArrays.hasOwnProperty(type)) {

										const featureType = featuresLists
											.filter((fType) =>
												fType.code === type)[0];

										const features = featureType.features
											.filter((feature) =>
												featureArrays[type].indexOf(feature.id.toString()) > -1);

										featureChanges[type] = {
											features: features
												.map((item): IDerbyFeatureChange => ({
													name: item.name,
													status: changeObject.features.delete
														.indexOf(`${type}-${item.id}`) > -1 ?
															"delete"
														: "unchanged",
												})),
											name: featureType.plural,
										};

									}
								}

							}

							if (changeObject.features.add && changeObject.features.add.length) {

								for (const change of changeObject.features.add) {

									const [type ] = change.split("-");
									const newFeature = findFeatureByString(change);
									const newFeatureChange: IDerbyFeatureChange = {
										name: newFeature.name,
										status: "add",
									};

									if (newFeature) {

										const featureType = featuresLists
											.filter((fType) =>
												fType.code === type)[0];

										if (featureChanges[type]) {

											featureChanges[type].features.push(newFeatureChange);

										} else {

											featureChanges[type] = {
												features: [{
													name: newFeature.name,
													status: "add",
												}],
												name: featureType.plural,
											};
										}

									}

								}

							}

							for (const type in featureChanges) {
								if (featureChanges.hasOwnProperty(type)) {

									featureChanges[type].features
										.sort((a, b) =>
											a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

								}
							}

							eventChanges.featureChanges = featureChanges;

							// Handle venue lookup from earlier

							const getVenueData = this.addPromise(
								Promise.all(venuePromise));

							getVenueData
								.then((venueData: [
									IDerbyVenue | null
								]) => {

									if (venuePromise.length) {

										eventChanges.venue = venueData[0];

									}

									this.setState({
										eventChanges,
										eventData,
										featureTypes,
										initialLoad: true,
										loading: false,
									});

								})
								.catch((error) => {

									throw(error);

								});

						} else {

							throw(new Error("Error loading data; bad venue change id?"));

						}

					})
					.catch((error) => {

						console.error(error);
						this.setState({
							dataError: true,
							loading: false,
						});

					})
					.finally(loadChange.clear);

			}).catch((error) => {

				console.error(error);
				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(loadData.clear);

	}

}
