import store from "redux/store";

import { IBoxListItem } from "interfaces/boxList";
import { IDerbyEvent, IDerbyEventChange } from "interfaces/event";
import { IDerbyVenue, IDerbyVenueChange } from "interfaces/venue";

import { mapChangeData } from "services/eventChangeService";
import { formatDateRange } from "services/timeService";
import { buildLocation, buildVenueLocation, getVenueDetails } from "services/venueService";

import moment from "moment";

export const mapEventChangesToBoxList = (
	events: IDerbyEventChange[],
): Array<Promise<IBoxListItem>> =>

	events
		.map((event): Promise<IBoxListItem> =>

			new Promise((resolve, reject, onCancel) => {

				const dataChanges = mapChangeData(event.changeObject.data);

				const changePromise = Promise.all([
					!event.id && !event.changeObject.newVenueData ?
						getVenueDetails(dataChanges.venue)
					: undefined,
				])
					.then((venueData: Array<IDerbyVenue | null>) => {

						if (event.id) {

							resolve ({
								changeId: event.changeId,
								country: event.venue.country,
								dates: event.dates,
								host: event.name ? event.host : undefined,
								id: event.id,
								location: buildVenueLocation(event.venue),
								name: event.name ? event.name : event.host,
								submittedDuration: event.submittedDuration,
								submittedTime: event.submittedTime,
								user: event.submitter,
							});

						} else {

							const state = store.getState();

							const newDays = event.changeObject.days
								.sort((a, b) =>
									a.value.datetime < b.value.datetime
										? -1
									: a.value.datetime > b.value.datetime
										? 1
									: 0);

							const newDates = formatDateRange({
								end: newDays.length > 1 ?
									moment(newDays[newDays.length - 1].value.datetime.substr(0, 10), "Y-MM-DD")
									: undefined,
								start: moment(newDays[0].value.datetime.substr(0, 10), "Y-MM-DD"),
							}, "short");

							let newLocation = "";

							if (event.changeObject.newVenueData) {

								let regionAbbr = "";

								if (event.changeObject.newVenueData.region) {

									const countryObject = state.dataGeography
										.filter((country) =>
											country.code === event.changeObject.newVenueData.country)[0];

									if (countryObject && countryObject.regions && countryObject.regions.length) {

										const regionObject = countryObject.regions
											.filter((region) =>
												region.id === event.changeObject.newVenueData.region)[0];

										if (regionObject) {

											regionAbbr = regionObject.abbreviation;

										}

									}

								}

								newLocation = buildLocation({
									city: event.changeObject.newVenueData.city,
									country: event.changeObject.newVenueData.country,
									region: regionAbbr,
								});

							} else {

								newLocation = buildVenueLocation(venueData[0]);

							}

							resolve ({
								changeId: event.changeId,
								country: event.venue.country,
								dates: newDates,
								host: dataChanges.name ? dataChanges.host : undefined,
								id: undefined,
								location: newLocation,
								name: dataChanges.name ? dataChanges.name : dataChanges.host,
								submittedDuration: event.submittedDuration,
								submittedTime: event.submittedTime,
								user: event.submitter,
							});

						}

					});

				onCancel(() => {
					changePromise.cancel();
				});

				return changePromise;

			}));

export const mapVenueChangesToBoxList = (
	venues: IDerbyVenueChange[],
): IBoxListItem[] =>

	venues
		.map((venue) => {

			if (venue.id) {

				return {
					changeId: venue.changeId,
					country: venue.country,
					id: venue.id,
					location: buildVenueLocation(venue),
					name: venue.name,
					submittedDuration: venue.submittedDuration,
					submittedTime: venue.submittedTime,
					user: venue.submitter,
				};

			} else {

				const state = store.getState();

				let regionAbbr = "";

				const countryObject = state.dataGeography
					.filter((country) =>
						country.code === venue.changeObject.country)[0];

				if (venue.changeObject.region) {

					if (countryObject && countryObject.regions && countryObject.regions.length) {

						const regionObject = countryObject.regions
							.filter((region) =>
								region.id === venue.changeObject.region)[0];

						if (regionObject) {

							regionAbbr = regionObject.abbreviation;

						}

					}

				}

				return {
					changeId: venue.changeId,
					country: countryObject,
					id: undefined,
					location: buildLocation({
						city: venue.changeObject.city,
						country: venue.changeObject.country,
						region: regionAbbr,
					}),
					name: venue.changeObject.name,
					submittedDuration: venue.submittedDuration,
					submittedTime: venue.submittedTime,
					user: venue.submitter,
				};

			}

		});


export const mapEventsToBoxList = (
	events: IDerbyEvent[],
): IBoxListItem[] =>

	events.map((event): IBoxListItem => ({
		country: event.venue.country,
		dates: event.dates,
		distance: event.venue.distance,
		features: event.features,
		host: event.name ? event.host : undefined,
		id: event.id,
		location: buildVenueLocation(event.venue),
		name: event.name ? event.name : event.host,
		user: event.user,
	}));

export const mapVenuesToBoxList = (
	venues: IDerbyVenue[],
): IBoxListItem[] =>

	venues.map((venue): IBoxListItem => ({
		country: venue.country,
		id: venue.id,
		location: buildVenueLocation(venue),
		name: venue.name,
		user: venue.user,
	}));
