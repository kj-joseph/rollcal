import { loadEvents } from "services/eventService";
import { mapFeaturesToArrays } from "services/featureService";
import { filterLocationsByString } from "services/geoService";

import { IDerbyEvent, ISearchObject } from "interfaces/event";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";

const getSearchObjectFromUrl = (
	search: string,
): Promise<ISearchObject> =>

	new Promise((resolve, reject, onCancel) => {

		if (!search) {
			resolve({} as ISearchObject);
		}

		const promises: Array<Promise<void>> = [];
		const searchObject: ISearchObject = {
			features: [],
		} as ISearchObject;
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

					const [
						,
						,
						,
						,
						,
						distanceString,
						distanceUnits,
					]
						 = value.split("~");

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
				case "sanctions":
				case "tracks":

					searchObject.features = searchObject.features.concat(
						value.split(",")
							.map((feature) =>
								`${label.substring(0, label.length - 1)}-${feature}`));

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

export const getSearchUrl = (
	search: ISearchObject,
): string => {

	const queryParts = [];

	if (search.startDate) {

		queryParts.push(search.startDate);

	}

	if (search.endDate) {

		queryParts.push(search.endDate);

	}

	if (search.address) {

		queryParts.push(search.address);

	} else if (search.locations) {

		queryParts.push(`locations(${
			search.locations.map((country: IGeoCountry) =>
				country.code
				+ (country.regions && country.regions.length ?
					"-" + country.regions
							.map((reg: IGeoRegion) => (reg.id)).join("+")
					: "")).join(",")
				})`);

	}

	if (search.features && search.features.length) {

		const selectedFeatures = mapFeaturesToArrays(search.features);

		for (const type in selectedFeatures) {

			if (selectedFeatures.hasOwnProperty(type)) {

				queryParts.push(`${type}s(${
					selectedFeatures[type]
						.map((feature) =>
							feature)
						.sort()
						.join(",")})`);

			}

		}

	}

	return `/${queryParts.join("/")}`;

};

export const searchEventsByString = (
	searchString: string = undefined,
	count: number | "all" = "all",
	start: number = 0,
): Promise<{
	events: IDerbyEvent[],
	search: ISearchObject,
	total: number,
}> =>

	getSearchObjectFromUrl(searchString)
		.then((searchObject) => loadEvents(searchObject, count, start));
