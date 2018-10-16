import React from "react";
import { BrowserRouter as Router, NavLink } from "react-router-dom";

import {
	IDerbyEvent, IDerbyIcon, IDerbyIcons, IDerbySanction, IDerbyTrack, IDerbyType,
	IGeoCountry, IGeoRegion, IGeoRegionList,
} from "interfaces";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import moment from "moment";

import EventIconImage from "components/eventIconImage";
import { formatDateRange } from "lib/dateTime";

export default class Events<Props> extends React.Component<any, any, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			dataError: false,
			eventData: [] as IDerbyEvent[],
			isSearch: (this.props.match.params.startDate || window.location.search ? true : false),
			limit: this.props.limit || 12,
			loading: true,
			searchDisplayDates: null,
			searchDisplayDerbyTypes: null,
			searchDisplayLocations: null,
			searchDisplaySanctions: null,
			searchDisplayTracks: null,
		};

	}

	componentWillMount() {

		const queryString: string = `${window.location.search}${!window.location.search ? "?" : "&"}`
			+ `startDate=${this.props.match.params.startDate || moment().format("YYYY-MM-DD")}`
			+ `${this.props.match.params.endDate ? "&endDate=" + this.props.match.params.endDate : ""}`;

		const dateDisplay: string = formatDateRange({
			firstDay: moment(this.props.match.params.startDate) || moment(),
			lastDay: moment(this.props.match.params.endDate) || null,
		}, "long");

		if (queryString) {
			const qsParts = queryString.substr(1).split("&");
			const countries: string[] = [];
			const countryRegions: any = {};
			let regions: number[] = [];
			let tracks: string[] = [];
			let derbytypes: string[] = [];
			let sanctions: string[] = [];
			const serverData: any = {};

			for (let q = 0; q < qsParts.length; q ++) {
				const param = qsParts[q].split("=");

				switch (param[0]) {
					case "locations":
						const locations = param[1].split(";");

						for (let l = 0; l < locations.length; l ++) {
							const loc = locations[l].split("-");
							countries.push(loc[0]);

							if (loc.length > 1) {
								const regionsInfo = loc[1].split(",");
								regions = regions.concat(regionsInfo.map((x: string) => {
									return Number(x);
								}));
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

			const promises: Array<Promise<void>> = [];

			if (countries.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "geography/getCountriesByCodes/" + countries.join(","))
					.then((result: AxiosResponse) => {
						serverData.countries = result.data.response;
						resolve();
					});
				}));
			}

			if (regions.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "geography/getRegionsByIds/" + regions.join(","))
					.then((result: AxiosResponse) => {
						serverData.regions = result.data.response;
						resolve();
					});
				}));
			}

			if (tracks.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getTracks")
					.then((result: AxiosResponse) => {
						serverData.tracks = result.data.response;
						resolve();
					});
				}));
			}

			if (derbytypes.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getDerbyTypes")
					.then((result: AxiosResponse) => {
						serverData.derbytypes = result.data.response;
						resolve();
					});
				}));
			}

			if (sanctions.length) {
				promises.push(new Promise((resolve, reject) => {
					axios.get(this.props.apiLocation + "eventFeatures/getSanctionTypes")
					.then((result: AxiosResponse) => {
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
					const countriesList = [];

					for (let country = 0; country < countries.length; country ++) {
						let thisCountry = serverData.countries.filter((x: IGeoCountry) => x.country_code === countries[country])[0].country_name;

						if (countryRegions[countries[country]]) {
							const theseRegions: IGeoRegion[] = [];
							for (let region = 0; region < countryRegions[countries[country]].length; region ++) {
								theseRegions.push(serverData.regions.filter((x: IGeoRegion) => x.region_id === regions[region])[0].region_name);
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
						const tracksList = [];
						for (let f = 0; f < tracks.length; f ++) {
							tracksList.push(serverData.tracks.filter((x: IDerbyTrack) => x.track_id.toString() === tracks[f])[0].track_name);
						}
						tracksText = tracksList.sort().join(", ");
					}
				}

				if (serverData.derbytypes) {
					if (serverData.derbytypes.length === derbytypes.length) {
						derbytypesText = "all";
					} else {
						const derbytypesList = [];
						for (let f = 0; f < derbytypes.length; f ++) {
							derbytypesList.push(serverData.derbytypes.filter((x: IDerbyType) => x.derbytype_id.toString() === derbytypes[f])[0].derbytype_name);
						}
						derbytypesText = derbytypesList.sort().join(", ");
					}
				}

				if (serverData.sanctions) {
					if (serverData.sanctions.length === sanctions.length) {
						sanctionsText = "all";
					} else {
						const sanctionsList = [];
						for (let f = 0; f < sanctions.length; f ++) {
							sanctionsList.push(serverData.sanctions.filter((x: IDerbySanction) => x.sanction_id.toString() === sanctions[f])[0].sanction_abbreviation);
						}
						sanctionsText = sanctionsList.sort().join(", ");
					}
				}

				this.setState({
					searchDisplayDates: dateDisplay || null,
					searchDisplayDerbyTypes: derbytypesText || null,
					searchDisplayLocations: locationText || null,
					searchDisplaySanctions: sanctionsText || null,
					searchDisplayTracks: tracksText || null,
				});

			});
		}


		axios.get(this.props.apiLocation + "events/search/" + queryString)
			.then((result: AxiosResponse) => {

				const eventData = [];

				for (let e = 0; e < result.data.response.length; e ++) {

					const eventResult = result.data.response[e];

					const icons: IDerbyIcons = {
						derbytypes: [],
						sanctions: [],
						tracks: [],
					};
					for (let t = 0; t < eventResult.tracks.length; t ++) {
						icons.tracks.push({
							filename: "track-" + eventResult.tracks[t].track_abbreviation,
							title: eventResult.tracks[t].track_name,
						});
					}
					for (let dt = 0; dt < eventResult.derbytypes.length; dt ++) {
						icons.derbytypes.push({
							filename: "derbytype-" + eventResult.derbytypes[dt].derbytype_abbreviation,
							title: eventResult.derbytypes[dt].derbytype_name,
						});
					}
					for (let s = 0; s < eventResult.sanctions.length; s ++) {
						icons.sanctions.push({
							filename: "sanction-" + eventResult.sanctions[s].sanction_abbreviation,
							title: eventResult.sanctions[s].sanction_name,
						});
					}

					eventData.push({
						address1: eventResult.venue_address1,
						address2: eventResult.venue_address2,
						dates_venue: formatDateRange({
								firstDay: moment.utc(eventResult.days[0].eventday_start_venue),
								lastDay: moment.utc(eventResult.days[eventResult.days.length - 1].eventday_start_venue),
							}, "long"),
						days: null,
						event_description: eventResult.event_description,
						event_link: eventResult.event_link,
						flag: eventResult.country_flag ? <span title={eventResult.country_name} className={`flag-icon flag-icon-${eventResult.country_flag}`} /> : null,
						host: eventResult.event_name ? eventResult.event_host : null,
						icons,
						id: eventResult.event_id,
						location: `${eventResult.venue_city} ${eventResult.region_abbreviation ? ", " + eventResult.region_abbreviation : ""}, ${eventResult.country_code}`,
						multiDay: eventResult.days.length > 1,
						name: eventResult.event_name ? eventResult.event_name : eventResult.event_host,
						user: eventResult.user_name,
						venue_description: eventResult.venue_description,
						venue_link: eventResult.venue_link,
						venue_name: eventResult.venue_name,
					});
				}

				this.setState({
					eventData,
					loading: false,
				});

			}).catch((error: AxiosError) => {
				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
				});

			});

	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.changePage("events");
		this.props.saveSearch(window.location.pathname + window.location.search);
		this.props.setMenuState(false);
	}

	render() {

		return (
			<React.Fragment>
				{this.state.isSearch ?
					<React.Fragment>
						<h1>Search Results</h1>
						{this.state.loading ?
							""
						:
						<div className="searchDisplay">
							<p><strong>Dates:</strong> {this.state.searchDisplayDates}{this.props.match.params.endDate ? "" : " – (all)"}</p>
							<p><strong>Locations:</strong> {}{this.state.searchDisplayLocations ? this.state.searchDisplayLocations : "all"}</p>
							<p><strong>Derby Type(s):</strong> {}{this.state.searchDisplayDerbyTypes ? this.state.searchDisplayDerbyTypes : "all"}</p>
							<p><strong>Sanctions:</strong> {}{this.state.searchDisplaySanctions ? this.state.searchDisplaySanctions : "all"}</p>
							<p><strong>Tracks:</strong> {}{this.state.searchDisplayTracks ? this.state.searchDisplayTracks : "all"}</p>
						</div>
						}
					</React.Fragment>
				:
					<h1>Upcoming Events</h1>
				}
				{this.state.loading ?
					<div className="loader" />
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
						{this.state.eventData.map((event: IDerbyEvent) => (
							<li key={event.id}>
								<p className="eventDate"><strong>{event.dates_venue}</strong></p>
								<p className="eventLocation">{event.location} {event.flag}</p>
								<h2><NavLink to={"/events/details/" + event.id} title="Search Events">
									{event.name}
								</NavLink></h2>
								{(event.host) ?	<h3>Hosted by {event.host}</h3> : ""}

								<div className="eventIcons">
									{(event.icons.tracks.length ?
										<span className="eventIconGroup eventIconTracks">
											{event.icons.tracks.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(event.icons.derbytypes.length ?
										<span className="eventIconGroup eventIconDerbytypes">
											{event.icons.derbytypes.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
											))}
										</span>
										: "" )}
									{(event.icons.sanctions.length ?
										<span className="eventIconGroup eventIconSanctions">
											{event.icons.sanctions.map((icon: IDerbyIcon) => (
												<EventIconImage icon={icon} key={icon.filename} />
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

}
