import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/api";

import { filterDerbyTypes, filterSanctions, filterTracks, getDerbySanctions, getDerbyTracks, getDerbyTypes } from "services/feature";
import { filterLocationsByString } from "services/geo";
import { formatDateRange } from "services/time";
import { mapUser } from "services/user";
import { mapVenue } from "services/venue";

import { IDBDerbyEvent, IDBDerbyEventDay, IDerbyEvent, IDerbyEventDay } from "interfaces/event";
import { IDerbyFeature, IDerbyFeatures } from "interfaces/feature";
import { ISearchObject } from "interfaces/search";

import moment from "moment";

export const getEvent = (
	id: number,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject) => {

		callApi(
			"get",
			`events/getEventDetails/${id}`,
		)
			.then((eventData: IDBDerbyEvent) =>
				mapEvent(eventData))

			.then((event: IDerbyEvent) =>
				resolve(event))

			.catch((error) =>
				reject(error));

	});

export const getSearchObject = (
	search: string,
): Promise<ISearchObject> =>

	new Promise((resolve, reject) => {

		if (!search) {
			resolve({} as ISearchObject);
		}

		const promises: Array<Promise<void>> = [];
		const searchObject: ISearchObject = {} as ISearchObject;
		const usedParts: string[] = [];

		for (const searchPart of search.split("/")) {

			if (!searchPart
				|| !searchPart.match(/^(?:locations|distance|derbytypes|endDate|sanctions|startDate|tracks)\([^\)]+\)/) ) {
				continue;
			}

			const [, label, value] = searchPart.match(/^([a-zA-Z]+)\((.*)\)/);

			// only use the first instance of a search type
			if (usedParts.indexOf(label) > -1) {
				continue;
			} else {
				usedParts.push(label);
			}

			switch (label) {

				case "startDate":
				case "endDate":

					searchObject[label] = value;

					break;

				case "distance":
					const [, , , , , distanceString, distanceUnits] = value.split("~");

					searchObject.address = value;
					searchObject.distance = Number(distanceString);
					searchObject.distanceUnits = distanceUnits === "km" ? "km" : "mi";

					break;

				case "locations":

					promises.push(
						filterLocationsByString(value)
							.then((locations) => {
								searchObject.locations = locations;
							}));

					break;

				case "derbytypes":

					promises.push(
						filterDerbyTypes(value.split(","))
							.then((derbytypes) => {
								searchObject.derbytypes = derbytypes;
							}));

					break;

				case "sanctions":

					promises.push(
						filterSanctions(value.split(","))
							.then((sanctions) => {
								searchObject.sanctions = sanctions;
							}));

					break;

				case "tracks":

					promises.push(
						filterTracks(value.split(","))
							.then((tracks) => {
								searchObject.tracks = tracks;
							}));

					break;

			}

			Promise.all(promises)
				.then(() => {
					if (searchObject.address && searchObject.distance && searchObject.distanceUnits) {
						delete searchObject.locations;
					}

					resolve(searchObject);
				});

		}

	});

export const loadEvents = (
	search: ISearchObject,
	count: number | "all" = "all",
	start: number = 0,
): Promise<{
	events: IDerbyEvent[],
	search: ISearchObject,
	total: number,
}> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		Promise.all([
			getDerbySanctions(),
			getDerbyTracks(),
			getDerbyTypes(),
		])
			.then(() => {

				const apiSearch = {
					address: null as string,
					count,
					country: null as string,
					derbytypes: search.derbytypes ?
						search.derbytypes.map((derbytype) => derbytype.id).join(",")
						: undefined,
					distance: null as number,
					endDate: search.endDate,
					locations: search.locations ? search.locations.map((country) =>
						`${country.code}${country.regions ?
							`-${country.regions.map((region) => region.id).join(" ")}`
							: ""}`).join(",")
						: undefined,
					sanctions: search.sanctions ?
						search.sanctions.map((sanction) => sanction.id).join(",")
						: undefined,
					start,
					startDate: search.startDate || moment().format("Y-MM-DD"),
					tracks: search.tracks ?
						search.tracks.map((track) => track.id).join(",")
						: undefined,
					user: search.user,
				};

				if (search.address) {

					// distance search takes precedence over location search
					delete apiSearch.locations;

					const [address1, city, regionAbbr, postal, countryCode, distanceString, distanceUnits]
						= search.address.split("~");

					apiSearch.address = `${address1}, ${city}${
						regionAbbr ? `, ${regionAbbr}` : ""
					}${
						postal ? ` ${postal}` : ""
					}`;

					apiSearch.country = countryCode;
					apiSearch.distance = Number(distanceString) / (distanceUnits === "km" ? state.kmConverter : 1);

				}

				callApi(
					"get",
					`events/search`,
					apiSearch,
				)
					.then((result) => {

						const eventResults: IDBDerbyEvent[] = result.events;
						const events: Array<Promise<IDerbyEvent>> = [];

						for (const eventItem of eventResults) {

							events.push(mapEvent(eventItem));

						}

						Promise.all(events)
							.then((eventList: IDerbyEvent[]) => {

								store.dispatch(actions.saveLastSearch(search));

								resolve({
									events: eventList,
									search,
									total: result.total,
								});

							});

					})
					.catch((exception) => {

						reject(exception);

					});

			});

	});

};

const mapDays = (
	data: IDBDerbyEventDay[],
): IDerbyEventDay[] =>

	data.map((day) => ({
		date: moment.utc(day.eventday_start_venue).format("MMM D"),
		description: day.eventday_description,
		doorsTime: day.eventday_doors_venue
			&& day.eventday_doors_venue < day.eventday_start_venue
			? moment.utc(day.eventday_doors_venue).format("h:mm a")
			: "",
		startTime: moment.utc(day.eventday_start_venue).format("h:mm a"),
	}));

const mapEvent = (
	data: IDBDerbyEvent,
): Promise<IDerbyEvent> => {

	return new Promise((resolve, reject) => {

		const features: IDerbyFeatures = {
			derbytypes: {} as IDerbyFeature[],
			sanctions: {} as IDerbyFeature[],
			tracks: {} as IDerbyFeature[],
		};

		const promises: Array<Promise<void>> = [];

		if (data.derbytypes) {
			promises.push(

				filterDerbyTypes(data.derbytypes.split(","))
					.then((derbytypes) => {
						features.derbytypes = derbytypes;
					}));
		}

		if (data.sanctions) {
			promises.push(
				filterSanctions(data.sanctions.split(","))
					.then((sanctions) => {
						features.sanctions = sanctions;
					}));
		}

		if (data.tracks) {
			promises.push(
				filterTracks(data.tracks.split(","))
					.then((tracks) => {
						features.tracks = tracks;
					}));
		}

		Promise.all(promises).then(() => {

			resolve ({
				dates: formatDateRange({
						end: moment.utc(data.event_last_day),
						start: moment.utc(data.event_first_day),
					}, "long"),
				days: data.days && data.days.length ?
					mapDays(data.days)
					: null,
				description: data.event_description,
				features,
				host: data.event_name ? data.event_host : null,
				id: data.event_id,
				link: data.event_link,
				multiDay: data.event_first_day ?
					data.event_first_day.substring(0, 10) !== data.event_last_day.substring(0, 10)
					: null,
				name: data.event_name ? data.event_name : data.event_host,
				user: mapUser(data),
				venue: mapVenue(data),
			});

		});

	});

};

export const searchEventsByString = (
	searchString: string = null,
	count: number | "all" = "all",
	start: number = 0,
): Promise<{
	events: IDerbyEvent[],
	search: ISearchObject,
	total: number,
}> => {

	return getSearchObject(searchString)
		.then((searchObject) => loadEvents(searchObject, count, start));

};
