import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { getFeatures, mapFeaturesFromText, mapFeaturesToArrays } from "services/featureService";
import { buildLocation } from "services/venueService";

import { IDerbyEvent, ISearchObject } from "interfaces/event";
import {  } from "interfaces/feature";

import moment from "moment";

export const deleteEvent = (
	id: number,
): Promise<void> =>

	new Promise((resolve, reject, onCancel) => {

		const apiCall = callApi(
			"delete",
			`event/${id}`,
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
			`event/${id}`,
		)
			.then((response) => {

				const eventData: IDerbyEvent = response.data;

				if (eventData && eventData.id.toString() === id.toString()) {

					return mapEventFeatures(eventData);

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

		const loadData = getFeatures()
			.then(() => {

				let featureSearch: string = "";

				if (search.features && search.features.length) {

					const featureArrays = mapFeaturesToArrays(search.features);

					for (const type in featureArrays) {
						if (featureArrays.hasOwnProperty(type)) {

							featureSearch +=
								(featureSearch ? "." : "")
								+ featureArrays[type].join(",");

						}
					}

				}

				const apiSearch = {
					address: undefined as string,
					count,
					country: undefined as string,
					distance: undefined as number,
					endDate: search.endDate,
					features: featureSearch || undefined,
					locations: search.locations ? search.locations.map((country) =>
						`${country.code}${country.regions ?
							`-${country.regions.map((region) => region.id).join(" ")}`
							: ""}`).join(",")
						: undefined,
					start,
					startDate: search.startDate || moment().format("Y-MM-DD"),
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
					"events",
					apiSearch,
				);

				onCancel(() => {
					apiCall.cancel();
				});

				return apiCall;

			})
			.then((response) => {

				const eventData: IDerbyEvent[] = response.data.events;
				const total: number = response.data.total;

				const eventResolution =
					Promise.all(
						eventData
							.map((eventItem) =>
								mapEventFeatures(eventItem)))

						.then((eventList: IDerbyEvent[]) => {

							store.dispatch(actions.saveLastSearch(search));

							resolve({
								events: eventList,
								search,
								total,
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

export const mapEventFeatures = (
	data: IDerbyEvent,
): Promise<IDerbyEvent> =>

	new Promise((resolve, reject, onCancel) => {

		const featureMapping = mapFeaturesFromText(data.features)
			.then((features) => {

				resolve(Object.assign(data, {
					featureObjects: features,
				}));

			})
			.catch((error) => {

				reject(error);

			});

		onCancel(() =>
			featureMapping.cancel());

	});
