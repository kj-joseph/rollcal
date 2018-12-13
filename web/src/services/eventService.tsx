import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { mapDays } from "services/eventDayService";
import { getDerbySanctions, getDerbyTracks, getDerbyTypes, mapFeatures } from "services/featureService";
import { formatDateRange } from "services/timeService";
import { mapUser } from "services/userService";
import { buildLocation, mapVenue } from "services/venueService";

import { IDBDerbyEvent, IDBDerbyEventChange, IDerbyEvent, ISearchObject } from "interfaces/event";
import { IDerbyFeatures } from "interfaces/feature";

import moment from "moment";

export const deleteEvent = (
	id: number,
): Promise<void> =>

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
			.then((eventData: IDBDerbyEvent) => {

				if (eventData) {

					return mapEvent(eventData);

				} else {

					reject(new Error("Event not found"));

				}

			})

			.then((event: IDerbyEvent) =>
				resolve(event))

			.catch((error) =>
				reject(error));

		onCancel(() => {
			apiCall.cancel();
		});

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

					// ignore locations if searching by address
					delete apiSearch.locations;

					const [
						address1,
						city,
						region,
						postcode,
						country,
						distanceString,
						distanceUnits,
					]
						= search.address.split("~");

					apiSearch.address = buildLocation({
						address1,
						city,
						country,
						postcode,
						region,
					});

					apiSearch.country = country;
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
			.then((result: {
				events: IDBDerbyEvent[],
				total: number,
			}) => {

				const eventResolution =
					Promise.all(
						result.events
							.map((eventItem) =>
								mapEvent(eventItem)))

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

export const mapEvent = (
	data: IDBDerbyEvent | IDBDerbyEventChange,
	includeFeatures: boolean = true,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject, onCancel) => {

		const dataPromises = includeFeatures ?
			[
				mapFeatures({
					derbytypes: data.derbytypes ? data.derbytypes.split(",") : [],
					sanctions: data.sanctions ? data.sanctions.split(",") : [],
					tracks: data.tracks ? data.tracks.split(",") : [],
				}),
			]
			: [];

		const loadData =
			Promise.all(dataPromises)
				.then((featureResponse: [IDerbyFeatures]) => {

					const event: IDerbyEvent = {
						dates: formatDateRange({
								end: moment.utc(data.event_last_day),
								start: moment.utc(data.event_first_day),
							}, "long"),
						days: data.days && data.days.length ?
							mapDays(data.days)
							: undefined,
						description: data.event_description,
						host: data.event_host,
						id: data.event_id,
						link: data.event_link,
						multiDay: data.event_first_day ?
							data.event_first_day.substring(0, 10) !== data.event_last_day.substring(0, 10)
							: undefined,
						name: data.event_name,
						user: mapUser(data),
						venue: mapVenue(data),
					};

					if (includeFeatures) {

						event.features = featureResponse[0];

					}

					resolve (event);

		});

		onCancel(() => {
			loadData.cancel();
		});

	});
