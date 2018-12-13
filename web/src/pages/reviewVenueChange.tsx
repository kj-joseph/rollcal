import RCComponent from "components/rcComponent";
import React from "react";
import { Link } from "react-router-dom";

import { IGeoCountry } from "interfaces/geo";
import { IProps } from "interfaces/redux";
import { ITimeZone } from "interfaces/time";
import { IDerbyVenue, IDerbyVenueChange } from "interfaces/venue";

import { getGeography } from "services/geoService";
import { getTimeZones } from "services/timeService";
import { checkUserRole } from "services/userService";
import { approveVenueChange, getVenueChange, rejectVenueChange } from "services/venueChangeService";

import Modal from "react-modal";
Modal.setAppElement("#root");

import CompareValues from "components/compareValues";

import CloseIcon from "images/times-circle.svg";
import ReactSVG from "react-svg";

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

export default class ReviewVenueChange extends RCComponent<IProps> {

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

										{(this.state.venueData.region && this.state.venueData.region.abbreviation)
											|| (this.state.venueChanges.region && this.state.venueChanges.region.abbreviation) ?
											<React.Fragment>
												{", "}
												<CompareValues
													oldValue={this.state.venueData.region.abbreviation}
													newValue={this.state.venueChanges.region.abbreviation}
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
											oldValue={this.state.venueData.country.name}
											newValue={this.state.venueChanges.country.name}
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
										oldValue={this.state.venueData.timezone.name}
										newValue={this.state.venueChanges.timezone.name}
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

		const approval = this.addPromise(
			approveVenueChange(this.props.match.params.changeId));

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

		const rejection = this.addPromise(
			rejectVenueChange(this.props.match.params.changeId, this.state.rejectComment));

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

			});

	}

	loadData() {

		this.setState({
			loading: true,
		});

		const loadData = this.addPromise(
			Promise.all([
				getGeography(),
				getTimeZones(),
				getVenueChange(this.props.match.params.changeId),
			]));

		loadData
			.then((data: [
				IGeoCountry[],
				ITimeZone[],
				IDerbyVenueChange
			]) => {

				const [countryList, timeZones, venueData] = data;
				const venueChanges = Object.assign({}, venueData);

				if (venueData && venueData.changeObject) {

					const changeObject = venueData.changeObject;

					for (const key in changeObject) {
						if (changeObject.hasOwnProperty(key)) {

							switch (key) {

								case "country":
									venueChanges.country = countryList
										.filter((country) =>
											country.code === changeObject.country)[0];

									break;

								case "region":
									if (changeObject.region) {

										const countryObject = countryList
											.filter((country) =>
												country.code === (changeObject.country || venueData.country))[0];

										if (countryObject && countryObject.regions && countryObject.regions.length) {

											const regionObject = countryObject.regions
												.filter((region) =>
													region.id === changeObject.region)[0];

											if (regionObject && regionObject.id) {

												venueChanges.region = regionObject;

											}

										}

									}

									break;

								case "timezone":
									venueChanges.timezone = timeZones.filter(
										(tz: ITimeZone) =>
											tz.id === changeObject.timezone)[0];
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

				this.setState({
					dataError: true,
					loading: false,
				});

			})
			.finally(loadData.clear);

	}

}
