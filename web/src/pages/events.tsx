import RCComponent from "components/rcComponent";
import React from "react";

import { mapEventsToBoxList } from "services/boxListService";
import { loadEvents } from "services/eventService";
import { mapFeaturesFromText } from "services/featureService";
import { searchEventsByString } from "services/searchService";
import { formatDateRange } from "services/timeService";
import { buildLocation } from "services/venueService";

import BoxList from "components/boxList";

import { IDerbyEvent, ISearchObject } from "interfaces/event";
import { IDerbyFeatureType } from "interfaces/feature";
import { IProps } from "interfaces/redux";

import moment from "moment";

interface IEventsState {
	dataError: boolean;
	eventList: IDerbyEvent[];
	featuresSearched: IDerbyFeatureType[];
	isSearch: string;
	listItemsTotal: number;
	listPageLength: number;
	loading: boolean;
	loadingMore: boolean;
	path: string;
	searchObject: ISearchObject;
}

export default class Events extends RCComponent<IProps> {

	state: IEventsState = {
		dataError: false,
		eventList: [],
		featuresSearched: [],
		isSearch: (this.props.match.params.startDate || window.location.pathname !== "/"),
		listItemsTotal: 0,
		listPageLength: this.props.listPageLength,
		loading: true,
		loadingMore: false,
		path: null,
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

								{this.state.searchObject.startDate ?

									<p><strong>Dates:</strong> {
										formatDateRange({
											end: this.state.searchObject.endDate ? moment(this.state.searchObject.endDate, "Y-MM-DD") : null,
											start: this.state.searchObject.startDate ? moment(this.state.searchObject.startDate, "Y-MM-DD") : moment(),
										}, "long")
									}{this.state.searchObject.endDate ? "" : " – (all)"}</p>

								: null}

								{this.state.searchObject.address
									&& this.state.searchObject.distance
									&& this.state.searchObject.distanceUnits ?

									<p><strong>Distance:</strong> {}{
										`within ${Number(this.state.searchObject.distance).toLocaleString()
											} ${this.state.searchObject.distanceUnits} of `}
										<em className="searchAddress">{this.displaySearchAddress(this.state.searchObject.address)}</em>
									</p>

								: this.state.searchObject.locations && this.state.searchObject.locations.length ?

									<p><strong>Locations:</strong> {
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
									}</p>

								: null}

								{this.state.featuresSearched && this.state.featuresSearched.length ?

									this.state.featuresSearched
										.map((type) => (

											type.features && type.features.length ?

												<p key={type.code}>
													<strong>
														{type.features.length === 1 ?
															type.singular
														: type.plural}:
													</strong>

													{type.features
														.map((feature) => {

															switch (type.code) {

																case "sanction":
																	return feature.abbreviation;
																	break;

																default:
																	return feature.name;
																	break;
															}

														}).join(", ")}
												</p>

											: null

										))

								: null}

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
			.then((data: {
					events: IDerbyEvent,
					total: number,
					search: ISearchObject}) => {

				const {events, total, search} = data;

				const mapFeatures = this.addPromise(
					mapFeaturesFromText(search.features));

				mapFeatures
					.then((featuresSearched) => {

						this.setState({
							eventList: events,
							featuresSearched,
							listItemsTotal: total,
							loading: false,
							loadingMore: false,
							searchObject: search,
						});

					})
					.catch((error) => {

						console.error(error);

						this.setState({
							dataError: true,
							loading: false,
							loadingMore: false,
						});

					})
					.finally(mapFeatures.clear);



			})
			.catch((error) => {

				console.error(error);

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

				console.error(error);

				this.setState({
					dataError: true,
					loading: false,
					loadingMore: false,
				});

			})
			.finally(loadEventPage.clear);

	}

}
