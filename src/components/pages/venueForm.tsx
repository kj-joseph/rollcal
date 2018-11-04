import React from "react";
import { Link } from "react-router-dom";

import { IDerbyVenue,
	IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList, ITimeZone,
	} from "components/interfaces";
import { getGeography, getTimeZones } from "components/lib/data";

import axios, { AxiosError, AxiosResponse } from "axios";

import Select from "react-select";

export default class VenueForm<Props> extends React.Component<any, any, any> {

	constructor(props: Props) {
		super(props);

		this.state = {
			countryList: [] as IGeoCountry[],
			dataError: false,
			initialVenueData: {} as IDerbyVenue,
			loading: true,
			pageFunction: this.props.match.params.operation === "add" ? "Add New Venue" :
				this.props.match.params.operation === "edit"
					&& this.props.match.params.venueId
					&& this.props.match.params.venueId.match(/[0-9]+/)
					? "Edit Venue" : "Error",
			processing: false,
			regionLists: {} as IGeoRegionList,
			selectedCountry: {} as IGeoCountry,
			selectedRegion: {} as IGeoRegion,
			selectedTimeZone: {} as ITimeZone,
			submitError: null,
			submitSuccess: false,
			timeZoneList: [],
			venueData: {} as IDerbyVenue,
		};

		this.handleCountryChange = this.handleCountryChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleRegionChange = this.handleRegionChange.bind(this);
		this.handleTimeZoneChange = this.handleTimeZoneChange.bind(this);
		this.submitVenueForm = this.submitVenueForm.bind(this);

	}

	componentDidUpdate() {

		if (!this.props.loggedIn) {
			this.props.history.push("/");
		} else if (window.location.pathname !== this.state.path
			|| this.props.loggedInUserId !== this.state.userId ) {

			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
				userId: this.props.loggedInUserId,
			});

			if (this.props.loggedInUserId && this.state.pageFunction !== "Error") {
				this.loadData();
			} else {
				this.setState({
					dataError: true,
					loading: false,
				});
			}

		}

	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

	}

	render() {

		return (
			<div className="venueForm">

				<p className="backToLink">
					<Link to="/dashboard/venues">
						&laquo; Back to your venues
					</Link>
				</p>

				<div>

					<h1>{this.state.pageFunction}</h1>

					{this.state.loading || this.state.processing ?

						<div className="loader" />

					: this.state.submitSuccess ?

						( this.state.venueData.id ?

							<React.Fragment>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your changes to this venue have been submitted.  Once one of our crack staff reviews your changes, we'll let you know.  Thanks for your help!</p>
							</React.Fragment>

						:

							<React.Fragment>
								<h2>Submission successful!  Thank you!</h2>
								<p>Your new venue has been submitted.  Once one of our crack staff reviews it, we'll let you know.  Thanks for your help!</p>
							</React.Fragment>

						)

					: this.state.dataError ?

						<div>
							<p>Sorry, there was an error. Please try again.</p>
						</div>

					:

						<React.Fragment>

							<div className="callout">
								<p className="header">IMPORTANT!</p>
								<p>
									Changes made to this venue will show on <em>all</em> events that list this venue.
									Don't use this to change the venue of an event; edit the event instead.
								</p>
							</div>

							<form
								className="entryForm"
								id="venueForm"
								onSubmit={this.submitVenueForm}
							>

								<div className="formSection">

									<div className="inputGroup">
										<label htmlFor="name">Name</label>
										<input
											id="name"
											name="name"
											type="text"
											required={true}
											value={this.state.venueData.name}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="address1">Street Address</label>
										<input
											id="address1"
											name="address1"
											type="text"
											required={true}
											value={this.state.venueData.address1}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="address2">Address Line 2 <em>(optional)</em></label>
										<input
											id="address2"
											name="address2"
											type="text"
											required={false}
											value={this.state.venueData.address2}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="city">City</label>
										<input
											id="city"
											name="city"
											type="text"
											required={true}
											value={this.state.venueData.city}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="country">Country</label>
										<Select
											id="country"
											name="search-countries"
											className="Select searchSelectCountries"
											classNamePrefix="Select"
											value={this.state.selectedCountry}
											onChange={this.handleCountryChange}
											options={this.state.countryList}
											getOptionLabel={this.getCountryOptionLabel}
											isSearchable={true}
											isClearable={true}
										/>
									</div>

									{(this.state.venueData.country && this.state.regionLists[this.state.venueData.country]) ?
										<div className="inputGroup selectRegion">
											<label htmlFor="region">{this.state.selectedCountry.country_region_type}</label>
											<Select
												id="region"
												name="search-countries"
												className="Select searchSelectRegions"
												classNamePrefix="Select"
												value={this.state.selectedRegion}
												onChange={this.handleRegionChange}
												options={this.state.venueData.country
													&& this.state.venueData.country
													&& this.state.regionLists[this.state.venueData.country]
													? this.state.regionLists[this.state.venueData.country]
													: []}
												getOptionLabel={this.getRegionOptionLabel}
												isSearchable={true}
												isClearable={true}
											/>
										</div>

									: ""}

									<div className="inputGroup">
										<label htmlFor="postcode">Postal Code <em>(optional, but suggested)</em></label>
										<input
											id="postcode"
											name="postcode"
											type="text"
											required={false}
											value={this.state.venueData.postcode}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup selectTimeZone">
										<label htmlFor="timezone">Time Zone</label>
										<Select
											id="timezone"
											name="timezone"
											className="Select"
											classNamePrefix="Select"
											value={this.state.selectedTimeZone}
											onChange={this.handleTimeZoneChange}
											options={this.state.timeZoneList}
											getOptionLabel={this.getTimeZoneLabel}
											isSearchable={true}
											isClearable={true}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="link">Website <em>(optional)</em></label>
										<input
											id="link"
											name="link"
											type="url"
											required={false}
											value={this.state.venueData.link}
											onChange={this.handleInputChange}
										/>
									</div>

									<div className="inputGroup">
										<label htmlFor="description">Description <em>(optional)</em></label>
										<textarea
											id="description"
											name="description"
											required={false}
											value={this.state.venueData.description}
											onChange={this.handleInputChange}
										/>
									</div>

								</div>

								{ this.state.submitError ?
									<p className="error">{this.state.submitError}</p>
								: "" }

								<div className="buttonRow">
									<button
										type="submit"
										disabled={
											!this.state.venueData.name
											|| !this.state.venueData.address1
											|| !this.state.venueData.city
											|| !this.state.venueData.country
											|| !this.state.venueData.timezone
										}
										className="largeButton"
									>
										Save {this.props.match.params.venueId ? "Changes" : "New Venue"}
									</button>
								</div>

							</form>

						</React.Fragment>

					}

				</div>
			</div>
		);

	}

	getCountryOptionLabel(option: IGeoCountry) {

		return option.country_name || "(type here to search list)";

	}

	getRegionOptionLabel(option: IGeoRegion) {

		return option.region_name || "(type here to search list)";

	}

	getTimeZoneLabel(timezone: ITimeZone) {

		if (timezone && timezone.timezone_name) {
			return timezone.timezone_name;
		} else {
			return "(Type here to search time zones)";
		}

	}

	handleCountryChange(country: IGeoCountry) {

		const venueData = this.state.venueData;

		if (country) {
			venueData.country = country.country_code;
		} else {
			venueData.country = null;
		}
		venueData.region = null;

		this.setState({
			selectedCountry: country || {} as IGeoCountry,
			selectedRegion: {} as IGeoRegion,
			venueData,
		});

	}

	handleRegionChange(region: IGeoRegion) {

		const venueData = this.state.venueData;

		if (region) {
			venueData.region = region.region_id;
		} else {
			venueData.region = null;
		}

		this.setState({
			selectedRegion: region || {} as IGeoRegion,
			venueData,
		});

	}

	handleInputChange(event: React.ChangeEvent<any>) {

		const venueData = this.state.venueData;
		venueData[event.currentTarget.name] = event.currentTarget.value;

		this.setState({
			venueData,
		});

	}

	handleTimeZoneChange(timezone: ITimeZone) {

		const venueData = this.state.venueData;

		if (timezone) {
			venueData.timezone = timezone.timezone_id;
		} else {
			venueData.timezone = null;
		}

		this.setState({
			selectedTimeZone: timezone || {} as IGeoRegion,
			venueData,
		});

		this.setState({
			timezone: timezone || {},
		});

	}

	loadData() {

		let countryList: IGeoCountry[] = [];
		const promises: Array<Promise<any>> = [];
		let regionLists: IGeoRegionList = {};
		let timeZones: ITimeZone[] = [];

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

			this.setState({
				countryList,
				regionLists,
				timeZoneList: timeZones,
			});

			if (this.props.match.params.venueId) {

				axios.get(`${this.props.apiLocation}venues/getVenueDetails/${this.props.match.params.venueId}`, { withCredentials: true })
					.then((result: AxiosResponse) => {

						if (result.data && result.data.venue_user === this.props.loggedInUserId) {

							this.setState({
								initialVenueData: {
									address1: result.data.venue_address1 || "",
									address2: result.data.venue_address2 || "",
									city: result.data.venue_city || "",
									country: result.data.venue_country || null,
									description: result.data.venue_description || "",
									id: result.data.venue_id || "",
									link: result.data.venue_link || "",
									name: result.data.venue_name || "",
									postcode: result.data.venue_postcode || "",
									region: result.data.venue_region || null,
									timezone: result.data.venue_timezone || null,
								},
								loading: false,
								selectedCountry: this.state.countryList
									.filter((country: IGeoCountry) => country.country_code === result.data.venue_country)[0]
									|| {} as IGeoCountry,
								selectedRegion: this.state.regionLists[result.data.venue_country] ?
										this.state.regionLists[result.data.venue_country]
											.filter((region: IGeoRegion) => region.region_id === result.data.venue_region)[0]
										|| {} as IGeoRegion : {} as IGeoRegion,
								selectedTimeZone: this.state.timeZoneList
									.filter((timezone: ITimeZone) => timezone.timezone_id === result.data.venue_timezone)
									|| {} as ITimeZone,
								venueData: {
									address1: result.data.venue_address1 || "",
									address2: result.data.venue_address2 || "",
									city: result.data.venue_city || "",
									country: result.data.venue_country || null,
									description: result.data.venue_description || "",
									id: result.data.venue_id || "",
									link: result.data.venue_link || "",
									name: result.data.venue_name || "",
									postcode: result.data.venue_postcode || "",
									region: result.data.venue_region || null,
									timezone: result.data.venue_timezone || null,
								},
							});

						} else {
							// no result, likely bad event ID in URL

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

				} else {

					this.setState({
						editingDays: [],
						initialVenueData: {
							address1: "",
							address2: "",
							city: "",
							country: null,
							description: "",
							link: "",
							name: "",
							postcode: "",
							region: null,
							timezone: null,
						},
						loading: false,
						venueData: {
							address1: "",
							address2: "",
							city: "",
							country: null,
							description: "",
							link: "",
							name: "",
							postcode: "",
							region: null,
							timezone: null,
						},
					});

				}

		});

	}

	submitVenueForm(event: React.MouseEvent<HTMLFormElement>) {

		event.preventDefault();

		this.setState({
			processing: true,
		});

		const dataChanges = {} as {[key: string]: any};

		for (const field in this.state.venueData) {
			if (field === "id") {
				continue;
			}
			const initialValue = this.state.initialVenueData[field] || null;
			const value = this.state.venueData[field] || null;

			if ((!this.state.venueData.id && value)
				|| (this.state.venueData.id && value !== initialValue)) {
				dataChanges[field] = value;
			}
		}

		if (Object.keys(dataChanges).length) {

			axios.put(`${this.props.apiLocation}venues/saveChanges`, {
				changeObject: JSON.stringify(dataChanges),
				id: this.state.venueData.id || 0,
			}, { withCredentials: true })

			.then((result: AxiosResponse) => {

				this.setState({
					processing: false,
					submitSuccess: true,
				});


			}).catch((error: AxiosError) => {

				this.setState({
					processing: false,
					submitError: "There was an error submitting your changes. Please try again.",
				});

			});

		} else {

			this.setState({
				processing: false,
				submitError: "You haven't made any changes.",
			});

		}

	}

}
