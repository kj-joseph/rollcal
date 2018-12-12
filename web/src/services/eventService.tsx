import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { mapDays } from "services/eventDayService";
import { filterDerbyTypes, filterSanctions, filterTracks, getDerbySanctions, getDerbyTracks, getDerbyTypes } from "services/featureService";
import { filterLocationsByString } from "services/geoService";
import { formatDateRange } from "services/timeService";
import { mapUser } from "services/userService";
import { mapVenue } from "services/venueService";

import { IDBDerbyEvent, IDerbyEvent, IDerbyEventChangeObject, ISearchObject} from "interfaces/event";
import { IDerbyFeature, IDerbyFeatures } from "interfaces/feature";

import moment from "moment";

export const deleteEvent = (
	id: number,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"delete",
			`events/deleteEvent/${id}`,
		)
			.then(() =>
				resolve())

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getEventDetails = (
	id: number,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"get",
			`events/getEventDetails/${id}`,
		)
			.then((eventData: IDBDerbyEvent) =>
				mapEvent(eventData))

			.then((event: IDerbyEvent) =>
				resolve(event))

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const getSearchObject = (
	search: string,
): Promise<ISearchObject> =>

	new Promise((resolve, reject, onCancel) => {

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

			const loadData = Promise.all(promises)
				.then(() => {
					if (searchObject.address && searchObject.distance && searchObject.distanceUnits) {
						delete searchObject.locations;
					}

					resolve(searchObject);
				});

			onCancel(() => {
				loadData.cancel();
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
}> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		const loadData = Promise.all([
			getDerbySanctions(),
			getDerbyTracks(),
			getDerbyTypes(),
		]);

		loadData
			.then(() => {

				const apiSearch = {
					address: undefined as string,
					count,
					country: undefined as string,
					derbytypes: search.derbytypes ?
						search.derbytypes.map((derbytype) => derbytype.id).join(",")
						: undefined,
					distance: undefined as number,
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

					const [address1, city, regionAbbr, postcode, countryCode, distanceString, distanceUnits]
						= search.address.split("~");

					apiSearch.address = `${address1}, ${city}${
						regionAbbr ? `, ${regionAbbr}` : ""
					}${
						postcode ? ` ${postcode}` : ""
					}`;

					apiSearch.country = countryCode;
					apiSearch.distance = Number(distanceString) / (distanceUnits === "km" ? state.kmConverter : 1);

				}

				return apiSearch;

			})
			.then ((apiSearch) => {

				const apiCall = callApi(
					"get",
					"events/search",
					apiSearch,
				);

				onCancel(() => {
					apiCall.cancel();
				});

				return apiCall;

			})
			.then((result) => {

				const eventResults: IDBDerbyEvent[] = result.events;
				const events: Array<Promise<IDerbyEvent>> = [];

				for (const eventItem of eventResults) {

					events.push(mapEvent(eventItem));

				}

				const eventResolution = Promise.all(events)
					.then((eventList: IDerbyEvent[]) => {

						store.dispatch(actions.saveLastSearch(search));

						resolve({
							events: eventList,
							search,
							total: result.total,
						});

					});

				onCancel(() => {
					eventResolution.cancel();
				});

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			loadData.cancel();
		});

	});

const mapEvent = (
	data: IDBDerbyEvent,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject, onCancel) => {

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

		const loadData = Promise.all(promises).then(() => {

			resolve ({
				dates: formatDateRange({
						end: moment.utc(data.event_last_day),
						start: moment.utc(data.event_first_day),
					}, "long"),
				days: data.days && data.days.length ?
					mapDays(data.days)
					: undefined,
				description: data.event_description,
				features,
				host: data.event_host,
				id: data.event_id,
				link: data.event_link,
				multiDay: data.event_first_day ?
					data.event_first_day.substring(0, 10) !== data.event_last_day.substring(0, 10)
					: undefined,
				name: data.event_name,
				user: mapUser(data),
				venue: mapVenue(data),
			});

		});

		onCancel(() => {
			loadData.cancel();
		});

	});

export const saveEventChange = (
	changes: IDerbyEventChangeObject,
	id: number = 0,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"put",
			"events/saveChanges",
			{
				changeObject: JSON.stringify(changes),
				id,
			},
		);

		apiCall
			.then(() => {

				resolve();

			})
			.catch((error) =>

				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

	});

export const searchEventsByString = (
	searchString: string = undefined,
	count: number | "all" = "all",
	start: number = 0,
): Promise<{
	events: IDerbyEvent[],
	search: ISearchObject,
	total: number,
}> =>

	getSearchObject(searchString)
		.then((searchObject) => loadEvents(searchObject, count, start));
