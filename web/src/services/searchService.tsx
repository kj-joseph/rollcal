import { loadEvents } from "services/eventService";
import { filterDerbyTypes, filterSanctions, filterTracks } from "services/featureService";
import { filterLocationsByString } from "services/geoService";

import { IDerbyEvent, ISearchObject } from "interfaces/event";
import { IGeoCountry, IGeoRegion } from "interfaces/geo";

const getSearchObject = (
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

export const getSearchUrl = (
	search: ISearchObject,
) => {

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

	if (search.derbytypes && search.derbytypes.length) {

		queryParts.push(`derbytypes(${
			search.derbytypes
				.map((derbytype) =>
					derbytype.id)
				.sort()
				.join(",")})`);

	}

	if (search.sanctions && search.sanctions.length) {

		queryParts.push(`sanctions(${
			search.sanctions
				.map((sanction) =>
					sanction.id)
				.sort()
				.join(",")})`);

	}

	if (search.tracks && search.tracks.length) {

		queryParts.push(`tracks(${
			search.tracks
				.map((track) =>
					track.id)
				.sort()
				.join(",")})`);

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

	getSearchObject(searchString)
		.then((searchObject) => loadEvents(searchObject, count, start));
