import React from "react";
import { NavLink } from "react-router-dom";

import {
	IDerbyEvent, IDerbyIcon, IDerbyIcons, IDerbySanction, IDerbyTrack, IDerbyType,
	IGeoCountry, IGeoData, IGeoRegion, IGeoRegionList,
} from "components/interfaces";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes, getGeography } from "components/lib/data";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import moment from "moment";

import EventIconImage from "components/partials/eventIconImage";
import { formatDateRange } from "components/lib/dateTime";

export default class Events<Props> extends React.Component<any, any, any> {
	constructor(props: Props) {
		super(props);

		this.state = {
			dataError: false,
			eventData: [] as IDerbyEvent[],
			isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
			limit: this.props.limit || 12,
			loading: true,
			path: null as string,
			searchDisplayDates: null,
			searchDisplayDerbyTypes: null,
			searchDisplayLocations: null,
			searchDisplaySanctions: null,
			searchDisplayTracks: null,
		};

		this.loadData = this.loadData.bind(this);

	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.changePage("events");
		this.props.setMobileMenuState(false);
	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
			});
			this.loadData();

		}
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
							<p><strong>Sanctions:</strong> {}{this.state.searchDisplaySanctions ? this.state.searchDisplaySanctions : "all (or unsanctioned)"}</p>
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
								<h2><NavLink to={"/event/" + event.id} title="Search Events">
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

	loadData() {

		this.setState({
			eventData: [],
			loading: true,
		});

		const queryStringParts: string[] = [];
		const saveSearchParts: string[] = [];

		const queryStringDates: string = `${window.location.search}${!window.location.search ? "?" : "&"}`
			+ `startDate=${this.props.match.params.startDate || moment().format("YYYY-MM-DD")}`
			+ `${this.props.match.params.endDate ? "&endDate=" + this.props.match.params.endDate : ""}`;

		const dateDisplay: string = formatDateRange({
			firstDay: moment(this.props.match.params.startDate) || moment(),
			lastDay: this.props.match.params.endDate ? moment(this.props.match.params.endDate) : null,
		}, "long");

		if (queryStringDates) {
			const promises: Array<Promise<void>> = [];
			const searchParts: string[] = this.props.match.params.param1 ?
				this.props.match.params.param1.split("/") : [];
			const usedParts: string[] = [];

			for (const part of searchParts) {

				if (!part
					|| !part.match(/(?:locations|derbytypes|sanctions|tracks)\([^\)]+\)/) ) {
					continue;
				}


				const [, label, values] = part.match(/([a-z]+)\((.*)\)/);

				if (usedParts.indexOf(label) > -1) {
					continue;
				} else {
					usedParts.push(label);
				}

				switch (label) {
					case "locations":
						let hasValidLocation = false;

						promises.push(getGeography(this.props)
							.then((dataResponse: IGeoData) => {

								const geoDisplay: string[] = [];
								const validLocations: string[] = [];

								for (const loc of values.split(",")) {
									const [country, regions] = loc.split("-");

									if (!dataResponse.countries.filter((c: IGeoCountry) => c.country_code === country).length) {
										continue;
									} else if (regions && (!dataResponse.regions[country] || !dataResponse.regions[country].length)) {
										continue;
									} else {
										hasValidLocation = true;
									}

									geoDisplay.push(
										dataResponse.countries
											.filter((c: IGeoCountry) => c.country_code === country )[0].country_name
										+ (regions && dataResponse.regions[country] ? " (" +
											dataResponse.regions[country]
												.filter((r: IGeoRegion) => regions.split("+").indexOf(r.region_id.toString()) > -1 )
												.map((r: IGeoRegion) => r.region_name )
												.sort()
												.join(", ")
											+ ")" : "" ));

									validLocations.push(
										country
										+ (regions && dataResponse.regions[country] ? "-" +
											dataResponse.regions[country]
												.filter((r: IGeoRegion) => regions.split("+").indexOf(r.region_id.toString()) > -1 )
												.map((r: IGeoRegion) => r.region_id )
												.sort()
												.join("+")
											: "" ));

								}

								this.setState({
									searchDisplayLocations: geoDisplay.sort().join(", ")
										.replace(/[a-zA-Z]+ \(\)(?:, )?/g, "")});

								const locationString = `${validLocations.join(",").replace(/[A-Z]{3}-,/g, "").replace(/,?[A-Z]{3}-$/g, "")}`;

								if (locationString) {
									queryStringParts.push(`locations=${locationString}`);
									saveSearchParts.push(`locations(${locationString})`);
								}

							}).catch((err: ErrorEventHandler) => {
								console.error(err);
							}));

						break;

					case "derbytypes":

						promises.push(getDerbyTypes(this.props)
								.then((dataResponse: IDerbyType[]) => {

									const validTypes = dataResponse
										.filter((dt: IDerbyType) => values.split(",").indexOf(dt.derbytype_id.toString()) > -1 );

									this.setState({
										searchDisplayDerbyTypes: (validTypes.length === dataResponse.length ? null :
											validTypes
												.map((dt: IDerbyType) => dt.derbytype_name )
												.sort()
												.join(", "))});

									if (validTypes.length) {

										queryStringParts.push("derbytypes="
											+ validTypes
												.map((dt: IDerbyType) => dt.derbytype_id )
												.sort()
												.join(","));

										saveSearchParts.push("derbytypes("
											+ validTypes
												.map((dt: IDerbyType) => dt.derbytype_id )
												.sort()
												.join(",") + ")");
									}

								}).catch((err: ErrorEventHandler) => {
									console.error(err);
								}));

						break;

					case "sanctions":

						promises.push(getDerbySanctions(this.props)
								.then((dataResponse: IDerbySanction[]) => {

									const validSanctions = dataResponse
										.filter((s: IDerbySanction) => values.split(",").indexOf(s.sanction_id.toString()) > -1 );

									this.setState({
										searchDisplaySanctions: (validSanctions.length === dataResponse.length ? "all" :
											validSanctions
												.map((s: IDerbySanction) => s.sanction_abbreviation )
												.sort()
												.join(", "))});

									if (validSanctions.length) {

										queryStringParts.push("sanctions="
											+ validSanctions
												.map((s: IDerbySanction) => s.sanction_id )
												.sort()
												.join(","));

										saveSearchParts.push("sanctions("
											+ validSanctions
												.map((s: IDerbySanction) => s.sanction_id )
												.sort()
												.join(",") + ")");
									}

								}).catch((err: ErrorEventHandler) => {
									console.error(err);
								}));

						break;

					case "tracks":

						promises.push(getDerbyTracks(this.props)
								.then((dataResponse: IDerbyTrack[]) => {

									const validTracks = dataResponse
										.filter((t: IDerbyTrack) => values.split(",").indexOf(t.track_id.toString()) > -1 );

									this.setState({
										searchDisplayTracks: (validTracks.length === dataResponse.length ? null :
											validTracks
												.map((t: IDerbyTrack) => t.track_name )
												.sort()
												.join(", "))});

									if (validTracks.length) {

										queryStringParts.push("tracks="
											+ validTracks
												.map((t: IDerbyTrack) => t.track_id )
												.sort()
												.join(","));

										saveSearchParts.push("tracks("
											+ validTracks
												.map((t: IDerbyTrack) => t.track_id )
												.sort()
												.join(",") + ")");

									}

								}).catch((err: ErrorEventHandler) => {
									console.error(err);
								}));

						break;

				}

			}

			Promise.all(promises).then(() => {

				this.props.saveLastSearch(
					(this.props.match.params.startDate ? `/${this.props.match.params.startDate}` : "")
					+ (this.props.match.params.endDate ? `/${this.props.match.params.endDate}` : "")
					+ (saveSearchParts ? `/${saveSearchParts.join("/")}` : ""));

				axios.get(`${this.props.apiLocation}events/search/${queryStringDates}${queryStringParts.length ? `&${queryStringParts.join("&")}` : ""}`)
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
							searchDisplayDates: dateDisplay || null,
						});

					}).catch((error: AxiosError) => {
						console.error(error);

						this.setState({
							dataError: true,
						});

					});

			});
		}

	}

}