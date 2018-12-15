import RCComponent from "components/rcComponent";
import React from "react";

import { mapEventsToBoxList } from "services/boxListService";
import { loadEvents } from "services/eventService";
import { searchEventsByString } from "services/searchService";
import { formatDateRange } from "services/timeService";
import { buildLocation } from "services/venueService";

import BoxList from "components/boxList";

import { IDerbyEvent, ISearchObject } from "interfaces/event";
import { IProps } from "interfaces/redux";

import moment from "moment";

interface IEventsState {
	dataError: boolean;
	eventList: IDerbyEvent[];
	isSearch: string;
	listItemsTotal: number;
	listPageLength: number;
	loading: boolean;
	loadingMore: boolean;
	path: string;
	searchDisplayDates: string;
	searchDisplayDerbyTypes: string;
	searchDisplayDistance: string;
	searchDisplayLocations: string;
	searchDisplaySanctions: string;
	searchDisplayTracks: string;
	searchObject: ISearchObject;
}

export default class Events extends RCComponent<IProps> {

	state: IEventsState = {
		dataError: false,
		eventList: [],
		isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
		listItemsTotal: 0,
		listPageLength: this.props.listPageLength,
		loading: true,
		loadingMore: false,
		path: null,
		searchDisplayDates: null,
		searchDisplayDerbyTypes: null,
		searchDisplayDistance: null,
		searchDisplayLocations: null,
		searchDisplaySanctions: null,
		searchDisplayTracks: null,
		searchObject: {} as ISearchObject,
	};

	constructor(props: IProps) {
		super(props);

		this.initialLoad = this.initialLoad.bind(this);
		this.loadAll = this.loadAll.bind(this);
		this.loadPage = this.loadPage.bind(this);
	}

	componentDidMount() {

		window.scrollTo(0, 0);
		this.props.setSessionState(this.props.sessionInitialized);

		this.props.setPageTitle({
			page: this.state.isSearch ? "Search Results" : "Upcoming Events",
		});

	}

	componentDidUpdate() {

		if (window.location.pathname !== this.state.path) {

			this.setState({
				isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
				path: window.location.pathname,
			});
			this.initialLoad();

		}
	}

	render() {

		return (

			<>
				{this.state.isSearch ?

					<>
						<h1>Search Results</h1>
						{this.state.loading ?
							""
						:
						<div className="searchDisplay">

							<p><strong>Dates:</strong> {
								formatDateRange({
									end: this.state.searchObject.endDate ? moment(this.state.searchObject.endDate, "Y-MM-DD") : null,
									start: this.state.searchObject.startDate ? moment(this.state.searchObject.startDate, "Y-MM-DD") : moment(),
								}, "long")
							}{this.state.searchObject.endDate ? "" : " – (all)"}</p>

							{this.state.searchObject.address
								&& this.state.searchObject.distance
								&& this.state.searchObject.distanceUnits ?

								<p><strong>Distance:</strong> {}{
									`within ${Number(this.state.searchObject.distance).toLocaleString()
										} ${this.state.searchObject.distanceUnits} of `}
									<em className="searchAddress">{this.displaySearchAddress(this.state.searchObject.address)}</em>
								</p>

							:

								<p><strong>Locations:</strong> {
									this.state.searchObject.locations && this.state.searchObject.locations.length ?
										this.state.searchObject.locations
											.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
											.map((country) =>
												`${country.name}${
													country.regions && country.regions.length ?
														` (${country.regions
															.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
															.map((region) => region.name)
															.join(", ")
														})`
													: ""}`).join(", ")
									: "all"
								}</p>

							}

							<p><strong>Derby Type{!this.state.searchObject.derbytypes || this.state.searchObject.derbytypes.length !== 1 ? "s" : ""}:</strong> {
								this.state.searchObject.derbytypes && this.state.searchObject.derbytypes.length ?
									this.state.searchObject.derbytypes.length === this.props.dataDerbyTypes.length ? "all"
									: this.state.searchObject.derbytypes.map((derbytype) => derbytype.name).join(", ")
								 : "all"}</p>

							<p><strong>Sanction{!this.state.searchObject.sanctions || this.state.searchObject.sanctions.length !== 1 ? "s" : ""}:</strong> {
								this.state.searchObject.sanctions && this.state.searchObject.sanctions.length ?
									this.state.searchObject.sanctions.length === this.props.dataSanctions.length ? "all events with sanctioned games"
									: this.state.searchObject.sanctions.map((sanction) => sanction.abbreviation).join(", ")
								 : "all events (sanctioned or unsanctioned)"}</p>

							<p><strong>Track{!this.state.searchObject.tracks || this.state.searchObject.tracks.length !== 1 ? "s" : ""}:</strong> {
								this.state.searchObject.tracks && this.state.searchObject.tracks.length ?
									this.state.searchObject.tracks.length === this.props.dataTracks.length ? "all"
									: this.state.searchObject.tracks.map((track) => track.name).join(", ")
								 : "all"}</p>

						</div>
						}
					</>
				:
					<h1>Upcoming Events</h1>
				}

				{this.state.loading ?
					<div className="loader" />

				: this.state.dataError ?
					<p>Sorry, there was an error searching.  Please try again.</p>

				: this.state.listItemsTotal === 0 ?
					<p>Sorry, there are no events that match your search.  Please try again.</p>

				: this.state.listItemsTotal ?

					<>

						<p className="listCount">Showing {this.state.eventList.length} of {this.state.listItemsTotal} events</p>

						<BoxList
							data={mapEventsToBoxList(this.state.eventList)}
							distance={true}
							distanceUnits={this.state.searchObject.distanceUnits || "mi"}
							itemType="events"
							loadAllFunction={this.loadAll}
							loadMoreFunction={this.loadPage}
							listType="display"
							loadingMore={this.state.loadingMore}
							userId={this.props.user.id}
							paginate={true}
							totalItems={this.state.listItemsTotal}
						/>

					</>

				: null}

			</>

		);
	}

	displaySearchAddress(address: string): string {

		const [address1, city, region, postcode, country]
			= address.split("~");

		return buildLocation({
			address1,
			city,
			country,
			postcode,
			region,
		});

	}

	initialLoad(): void {

		this.setState({
			eventList: [],
			loading: true,
		});

		let searchString = this.props.match.params.param1 || "";

		if (this.props.match.params.startDate) {
			searchString = searchString.split("/").concat(`startDate(${this.props.match.params.startDate})`).join("/");
		}

		if (this.props.match.params.endDate) {
			searchString = searchString.split("/").concat(`endDate(${this.props.match.params.endDate})`).join("/");
		}

		const searchEvents = this.addPromise(
			searchEventsByString(searchString, this.state.listPageLength));

		searchEvents
			.then(({events, total, search}) => {

				this.setState({
					eventList: events,
					listItemsTotal: total,
					loading: false,
					loadingMore: false,
					searchObject: search,
				});

			})
			.catch((error) => {

				this.setState({
					dataError: true,
					loading: false,
					loadingMore: false,
				});

			})
			.finally(searchEvents.clear);

	}

	loadAll(
		event: React.MouseEvent<HTMLButtonElement>,
	): void {
		event.preventDefault();
		this.loadPage(null, true);
	}

	loadPage(
		event?: React.MouseEvent<HTMLButtonElement>,
		loadAll = false,
	): void {
		if (event) {
			event.preventDefault();
		}

		this.setState({
			loadingMore: true,
		});

		const loadEventPage = this.addPromise(
			loadEvents(
				this.state.searchObject,
				loadAll ? "all" : this.state.listPageLength,
				this.state.eventList.length,
			));

		loadEventPage
			.then(({events, total}) => {

				this.setState({
					eventList: this.state.eventList.concat(events),
					listItemsTotal: total,
					loading: false,
					loadingMore: false,
				});

			})
			.catch((error) => {

				this.setState({
					dataError: true,
					loading: false,
					loadingMore: false,
				});

			})
			.finally(loadEventPage.clear);

	}

}
