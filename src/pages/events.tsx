import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import axios from "axios";

import { formatDateRange } from "lib/dateTime";

export default class EventList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			eventData: [],
			dataError: false,
			limit: this.props.limit || 12,
			searchDisplayDates: null,
			searchDisplayLocations: null,
			searchDisplayTracks: null,
			searchDisplayDerbytypes: null,
			searchDisplaySanctions: null
		}

		this.getToday = () => {
			let d = new Date();

			return d.getFullYear() + "-"
				+ (d.getMonth() + 1 < 10 ? "0" : "") 
				+ (d.getMonth() + 1) + "-" 
				+ (d.getDate() + 1 < 10 ? "0" : "") 
				+ d.getDate();
		};

	}

	componentWillMount() {

		if (this.props.match.params.startDate || window.location.search) {
			this.isSearch = true;
//		} else if (this.props.lastSearch && this.props.lastSearch !== "/events" && this.props.lastSearch !=="/events/") {
//			this.isSearch = true;
//			this.props.history.push(this.props.lastSearch);
		} else {
			this.isSearch = false;
		}

		let queryString = window.location.search;
		let searchDisplay = {};

		queryString += (!queryString ? "?" : "&") + "startDate=" + (this.props.match.params.startDate || this.getToday());

		if (this.props.match.params.endDate) {
			queryString += "&endDate=" + this.props.match.params.endDate;
		}

		searchDisplay.dates = formatDateRange({
			firstDay: {
				start: this.props.match.params.startDate || this.getToday()
			},
			lastDay: {
				start: this.props.match.params.endDate || null
			}
		}, "long");

		if (queryString) {
			let qsParts = queryString.substr(1).split("&");
			let countries = [];
			let countryRegions = {};
			let regions = [];
			let tracks = [];
			let derbytypes = [];
			let sanctions = [];
			let serverData = {};

			for (let q = 0; q < qsParts.length; q ++) {
				let param = qsParts[q].split("=");

				switch(param[0]) {
					case "locations":
						let locations = param[1].split(";");

						for (let l = 0; l < locations.length; l ++) {
							let loc = locations[l].split("-");
							countries.push(loc[0]);

							if (loc.length > 1) {
								let regionsInfo = loc[1].split(",");
								regions = regions.concat(regionsInfo);
								countryRegions[loc[0]] = regionsInfo;
							}
						}

						break;

					case "tracks":
						tracks = param[1].split(",");
						break;

					case "derbytypes":
						derbytypes = param[1].split(",");
						break;

					case "sanctions":
						sanctions = param[1].split(",");
						break;
				}

			}

			let promises = [];

			if(countries.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "geography/getCountriesByCodes/" + countries.join(","))
					.then(result => {
						serverData.countries = result.data.response;
						resolve();
					});
				})); 
			}

			if(regions.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "geography/getRegionsByIds/" + regions.join(","))
					.then(result => {
						serverData.regions = result.data.response;
						resolve();
					});
				})); 
			}

			if(tracks.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getTracks")
					.then(result => {
						serverData.tracks = result.data.response;
						resolve();
					});
				})); 
			}

			if(derbytypes.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getDerbyTypes")
					.then(result => {
						serverData.derbytypes = result.data.response;
						resolve();
					});
				})); 
			}

			if(sanctions.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getSanctionTypes")
					.then(result => {
						serverData.sanctions = result.data.response;
						resolve();
					});
				})); 
			}

			Promise.all(promises).then(() => {
				let locationText = "";
				let tracksText = "";
				let derbytypesText = "";
				let sanctionsText = "";

				if (serverData.countries) {
					console.log("PANTS");
					let countriesList = [];

					for (let c = 0; c < countries.length; c ++) {
						let thisCountry = serverData.countries.filter((x) => x.country_code == countries[c])[0].country_name;

						if (countryRegions[countries[c]]) {							
							let theseRegions = [];
							for (let r = 0; r < countryRegions[countries[c]].length; r ++) {
								theseRegions.push(serverData.regions.filter((x) => x.region_id == regions[r])[0].region_name);
							}
							thisCountry += " (" + theseRegions.sort().join(", ") + ")";
						}

						countriesList.push(thisCountry);
					}

					locationText = countriesList.sort().join(", ");

				}

				if (serverData.tracks) {
					if (serverData.tracks.length === tracks.length) {
						tracksText = "all";
					} else {
						let tracksList = [];
						for (let f = 0; f < tracks.length; f ++) {
							tracksList.push(serverData.tracks.filter((x) => x.track_id == tracks[f])[0].track_name);
						}
						tracksText = tracksList.sort().join(", ");
					}
				}

				if (serverData.derbytypes) {
					if (serverData.derbytypes.length === derbytypes.length) {
						derbytypesText = "all";
					} else {
						let derbytypesList = [];
						for (let f = 0; f < derbytypes.length; f ++) {
							derbytypesList.push(serverData.derbytypes.filter((x) => x.derbytype_id == derbytypes[f])[0].derbytype_name);
						}
						derbytypesText = derbytypesList.sort().join(", ");
					}
				}

				if (serverData.sanctions) {
					if (serverData.sanctions.length === sanctions.length) {
						sanctionsText = "all";
					} else {
						let sanctionsList = [];
						for (let f = 0; f < sanctions.length; f ++) {
							sanctionsList.push(serverData.sanctions.filter((x) => x.sanction_id == sanctions[f])[0].sanction_abbreviation);
						}
						sanctionsText = sanctionsList.sort().join(", ");
					}
				}

				this.setState({
					searchDisplayDates: searchDisplay.dates || null,
					searchDisplayLocations: locationText || null,
					searchDisplayTracks: tracksText || null,
					searchDisplayDerbytypes: derbytypesText || null,
					searchDisplaySanctions: sanctionsText || null
				});

			});
		}


		axios.get(this.props.apiLocation + "events/search/" + queryString)
			.then(result => {

				let eventData = [];

				for (let e = 0; e < result.data.response.length; e ++) {
					let event = {};

					let eventResult = result.data.response[e];

					event.id = eventResult.event_id;

					if (eventResult.event_name) {
						event.name = eventResult.event_name
						event.host = eventResult.event_host; 
					} else {
						event.name = eventResult.event_host;
					}

					event.location = eventResult.venue_city;
					if (eventResult.region_abbreviation) {
						event.location += ", " + eventResult.region_abbreviation;
					}
					event.location += ", " + eventResult.country_code;
					if (eventResult.country_flag) {
						event.flag = <span title={eventResult.country_name} className={"flag-icon flag-icon-" + eventResult.country_flag}></span>;
					}

					event.dates_venue = formatDateRange({
						firstDay: {
							start: eventResult.days[0].eventday_start_venue,
							end: eventResult.days[0].eventday_end_venue
						},
						lastDay: {
							start: eventResult.days[eventResult.days.length - 1].eventday_start_venue,
							end: eventResult.days[eventResult.days.length - 1].eventday_end_venue
						}
					});

					event.icons = {
						tracks: [],
						derbytypes: [],
						sanctions: []
					};
					for (let t = 0; t < eventResult.tracks.length; t ++) {
						event.icons.tracks.push({
							title: eventResult.tracks[t].track_name,
							filename: "track-" + eventResult.tracks[t].track_abbreviation
						});
					}
					for (let dt = 0; dt < eventResult.derbytypes.length; dt ++) {
						event.icons.derbytypes.push({
							title: eventResult.derbytypes[dt].derbytype_name,
							filename: "derbytype-" + eventResult.derbytypes[dt].derbytype_abbreviation
						});
					}
					for (let s = 0; s < eventResult.sanctions.length; s ++) {
						event.icons.sanctions.push({
							title: eventResult.sanctions[s].sanction_name,
							filename: "sanction-" + eventResult.sanctions[s].sanction_abbreviation
						});
					}

					eventData.push(event);
				}

				this.setState({
					eventData: eventData,
					loading: false
				});

			}).catch(error => {

				this.setState({
					dataError: true,
					loading: false
				});

			}
		);

	}
/*
	shouldComponentUpdate(nextProps, nextState) {
		if (this.state.eventData !== nextState.eventData) {
			return true;
		}
		if (this.state.dataError !== nextState.dataError) {
			return true;
		}
		return false;
	}
*/
	componentDidMount() {
		window.scrollTo(0,0);
		this.props.changePage("events");
		this.props.saveSearch(window.location.pathname + window.location.search);
		this.props.setMenuState(false);
	}

	render() {

		return (
			<React.Fragment>
				{this.isSearch ?
					<React.Fragment>
						<h1>Search Results</h1>
						{this.isSearch ?
							<div className="searchDisplay">
								<p><strong>Dates:</strong> {this.state.searchDisplayDates}{this.props.match.params.endDate ? "" : " – (all)"}</p>
								<p><strong>Locations:</strong> {}{this.state.searchDisplayLocations ? this.state.searchDisplayLocations : "all"}</p>
								<p><strong>Derby types:</strong> {}{this.state.searchDisplayDerbytypes ? this.state.searchDisplayDerbytypes : "all"}</p>
								<p><strong>Sanctions:</strong> {}{this.state.searchDisplaySanctions ? this.state.searchDisplaySanctions : "all"}</p>
								<p><strong>Tracks:</strong> {}{this.state.searchDisplayTracks ? this.state.searchDisplayTracks : "all"}</p>
							</div>
						: ""
						}
					</React.Fragment>
				: 
					<h1>Upcoming Events</h1>
				}
				{this.state.loading ?
					<div className="loader"></div>
				: ""
				}
				{this.state.dataError && !this.state.loading ?
					<p>Sorry, there was an error searching.  Please try again.</p>
				: ""
				}
				{!this.state.dataError && this.state.eventData.length === 0 && !this.state.loading ?
					<p>Sorry, there are no events that match your search.  Please try again.</p>
				: ""
				}
				{!this.state.dataError &&  this.state.eventData.length > 0 && !this.state.loading ?
					<ul className="eventList">
						{this.state.eventData.map(event => (
							<li key={event.id}>
								<p className="eventDate"><strong>{event.dates_venue}</strong></p>
								<p className="eventLocation">{event.location} {event.flag}</p>
								<h2><NavLink to={"/events/details/" + event.id} title="Search Events">
									{event.name}
								</NavLink></h2>
								{(event.host) ?	<h3>Hosted by {event.host}</h3> : "" }

								<div className="eventIcons">
									{(event.icons.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											{event.icons.tracks.map(icon => (
												<img src={"/images/" + icon.filename + ".svg"} title={icon.title} alt={icon.title} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(event.icons.derbytypes.length ?
										<span className="eventIconGroup eventIconDerbytypes">
											{event.icons.derbytypes.map(icon => (
											<img src={"/images/" + icon.filename + ".svg"} title={icon.title} alt={icon.title} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(event.icons.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											{event.icons.sanctions.map(icon => (
											<img src={"/images/" + icon.filename + ".svg"} title={icon.title} alt={icon.title} key={icon.filename} />
											))}
										</span>
										: "" )}
								</div>

							</li>
						))}
					</ul>
				: ""
				}
			</React.Fragment>
		);
	}

};
