import React from "react";
import { Link } from "react-router-dom";

import axios, { AxiosError, AxiosResponse } from "axios";

import moment from "moment";

import { IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList, ITimeZone } from "components/interfaces";
import { getGeography, getTimeZones } from "components/lib/data";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

export default class ReviewVenueChange<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			errorMessage: null,
			loading: true,
			modalOpen: false,
			path: "",
			rejectComment: "",
			status: null,
			userId: null,
			venueChanges: {},
			venueData: {},
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
					<Link to="/dashboard/venues/changes">
						&laquo; Back to venue changes
					</Link>
				</p>

				<div className="dashboard reviewVenueChange">

					<h1>Review Venue Change</h1>

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

						{this.state.venueChanges.changeId ?

							<React.Fragment>

								<dl className="changeDetails">

									<dt>Name:</dt>

									<dd>
										<span className={`old${this.state.venueChanges.name !== this.state.venueData.name ? " removed" : ""}`}>
											{this.state.venueData.name}
										</span>
										{this.state.venueChanges.name && this.state.venueChanges.name !== this.state.venueData.name ?
											<React.Fragment>
												{this.state.venueData.name ? " " : ""}
												<span className="new">{this.state.venueChanges.name}</span>
											</React.Fragment>
										: ""}
									</dd>

									<dt>Address:</dt>

									<dd>

										<span className={`old${this.state.venueChanges.address1 !== this.state.venueData.address1 ? " removed" : ""}`}>
											{this.state.venueData.address1}
										</span>
										{this.state.venueChanges.address1 && this.state.venueChanges.address1 !== this.state.venueData.address1 ?
											<React.Fragment>
												{this.state.venueData.address1 ? " " : ""}
												<span className="new">{this.state.venueChanges.address1}</span>
											</React.Fragment>
										: ""}

										{this.state.venueData.address2 || this.state.venueChanges.address2 ?
											<React.Fragment>
												<br />
												<span className={`old${this.state.venueChanges.address2 !== this.state.venueData.address2 ? " removed" : ""}`}>
													{this.state.venueData.address2}
												</span>
												{this.state.venueChanges.address2 && this.state.venueChanges.address2 !== this.state.venueData.address2 ?
													<React.Fragment>
														{this.state.venueData.address2 ? " " : ""}
														<span className="new">{this.state.venueChanges.address2}</span>
													</React.Fragment>
												: ""}
											</React.Fragment>
										: ""}

										<br />

										<span className={`old${this.state.venueChanges.city !== this.state.venueData.city ? " removed" : ""}`}>
											{this.state.venueData.city}
										</span>
										{this.state.venueChanges.city && this.state.venueChanges.city !== this.state.venueData.city ?
											<React.Fragment>
												{this.state.venueData.city ? " " : ""}
												<span className="new">{this.state.venueChanges.city}</span>
											</React.Fragment>
										: ""}

										{this.state.venueData.region || this.state.venueChanges.region ?
											<React.Fragment>
												{", "}

												<span className={`old${this.state.venueChanges.region !== this.state.venueData.region ? " removed" : ""}`}>
													{this.state.venueData.region}
												</span>
												{this.state.venueChanges.region && this.state.venueChanges.region !== this.state.venueData.region ?
													<React.Fragment>
														{this.state.venueData.region ? " " : ""}
														<span className="new">{this.state.venueChanges.region}</span>
													</React.Fragment>
												: ""}

											</React.Fragment>
										: ""}

										{this.state.venueData.postcode || this.state.venueChanges.postcode ?
											<React.Fragment>
												{" "}

												<span className={`old${this.state.venueChanges.postcode !== this.state.venueData.postcode ? " removed" : ""}`}>
													{this.state.venueData.postcode}
												</span>
												{this.state.venueChanges.postcode && this.state.venueChanges.postcode !== this.state.venueData.postcode ?
													<React.Fragment>
														{this.state.venueData.postcode ? " " : ""}
														<span className="new">{this.state.venueChanges.postcode}</span>
													</React.Fragment>
												: ""}

											</React.Fragment>
										: ""}

										<br />

										<span className={`old${this.state.venueChanges.country !== this.state.venueData.country ? " removed" : ""}`}>
											{this.state.venueData.country}
										</span>
										{this.state.venueChanges.country && this.state.venueChanges.country !== this.state.venueData.country ?
											<React.Fragment>
												{this.state.venueData.country ? " " : ""}
												<span className="new">{this.state.venueChanges.country}</span>
											</React.Fragment>
										: ""}

									</dd>

									<dt>Link:</dt>

									<dd>
										{this.state.venueData.link || this.state.venueChanges.link ?
											<React.Fragment>
												<span className={`old${this.state.venueChanges.link !== this.state.venueData.link ? " removed" : ""}`}>
													{this.state.venueData.link}
												</span>
												{this.state.venueChanges.link && this.state.venueChanges.link !== this.state.venueData.link ?
													<React.Fragment>
														{this.state.venueData.link ? " " : ""}
														<span className="new">{this.state.venueChanges.link}</span>
													</React.Fragment>
												: ""}
											</React.Fragment>
										:
											<span className="nodata">(none)</span>
										}
									</dd>


									<dt>Description:</dt>

									<dd>
										{this.state.venueData.description || this.state.venueChanges.description ?
											<React.Fragment>
												<span className={`old${this.state.venueChanges.description !== this.state.venueData.description ? " removed" : ""}`}>
													{this.state.venueData.description}
												</span>
												{this.state.venueChanges.description && this.state.venueChanges.description !== this.state.venueData.description ?
													<React.Fragment>
														{this.state.venueData.description ? " " : ""}
														<span className="new">{this.state.venueChanges.description}</span>
													</React.Fragment>
												: ""}
											</React.Fragment>
										:
											<span className="nodata">(none)</span>
										}
									</dd>


									<dt>Time Zone:</dt>

									<dd>
										<span className={`old${this.state.venueChanges.timezone !== this.state.venueData.timezone ? " removed" : ""}`}>
											{this.state.venueData.timezone}
										</span>
										{this.state.venueChanges.timezone && this.state.venueChanges.timezone !== this.state.venueData.timezone ?
											<React.Fragment>
												{this.state.venueData.timezone ? " " : ""}
												<span className="new">{this.state.venueChanges.timezone}</span>
											</React.Fragment>
										: ""}
									</dd>

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

		axios.post(`${this.props.apiLocation}venues/rejectChange/${this.props.match.params.changeId}`,
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

		Promise.all(promises).then(() => {

			axios.get(`${this.props.apiLocation}venues/getChange/${this.props.match.params.changeId}`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					const venueData = result.data.changed_item_id ?
						{
							address1: result.data.venue_address1,
							address2: result.data.venue_address2,
							city: result.data.venue_city,
							country: result.data.country_name,
							description: result.data.venue_description,
							id: result.data.change_id,
							link: result.data.venue_link,
							name: result.data.venue_name,
							postcode: result.data.venue_postcode,
							region: result.data.region_abbreviation,
							timezone: timeZones.filter((tz: ITimeZone) => tz.timezone_id === result.data.venue_timezone)[0].timezone_name,
						}
					: {};

					const venueChanges: {[key: string]: any} = {
						changeId: result.data.change_id,
						submittedDuration: moment.duration(moment(result.data.change_submitted).diff(moment())).humanize(),
						submittedTime: moment(result.data.change_submitted).format("MMM D, Y h:mm a"),
						user: result.data.change_user,
						username: result.data.change_user_name,
					};

					if (result.data.change_object) {

						const changeObject = JSON.parse(result.data.change_object);

						for (const key in changeObject) {
							if (changeObject.hasOwnProperty(key)) {

								switch (key) {

									case "country":
										venueChanges[key] = countryList.filter(
											(country: IGeoCountry) => country.country_code === changeObject[key])[0].country_name;
										break;

									case "region":
										venueChanges[key] = regionLists[changeObject.country || venueData.country].filter(
											(region: IGeoRegion) => region.region_id === changeObject[key])[0].region_abbreviation;
										break;

									case "timezone":
										venueChanges[key] = timeZones.filter(
											(tz: ITimeZone) => tz.timezone_id === changeObject[key])[0].timezone_name;
										break;

									default:

										venueChanges[key] = changeObject[key];
										break;

								}

							}
						}

						this.setState({
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
