import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { IDBDerbyEvent } from "interfaces/event";
import { IGeoCountry, IGeoCountryFilter, IGeoRegion } from "interfaces/geo";
import { IDBDerbyVenue } from "interfaces/venue";

export const filterLocations = (
	search: IGeoCountryFilter[],
): Promise<IGeoCountry[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getGeo = getGeography()
			.then((countryList) => {

				const matches: IGeoCountry[] = [];

				for (const countryFilter of search) {

					const country = countryList.filter((c) => c.code === countryFilter.code)[0];

					if (!country) {
						// country code is bad
						continue;
					}

					if (countryFilter.regions) {

						if (!country.regionType) {
							// country has no regions
							continue;
						}

						country.regions = country.regions.filter((region) =>
							countryFilter.regions.indexOf(region.id.toString()) > -1 );

						if (!country.regions.length) {
							// no valid region codes for this country
							continue;
						}

					} else {

						delete country.regions;

					}

					matches.push(country);

				}

				resolve(matches);

			});

		onCancel(() => {
			getGeo.cancel();
		});

	});

export const filterLocationsByString = (
	locations: string,
): Promise<IGeoCountry[]> => {

	const countrySearch: IGeoCountryFilter[] = [];

	for (const loc of locations.split(",")) {

		const [countryCode, regionIds] = loc.split("-");
		const countryFilter: IGeoCountryFilter = {
			code: countryCode,
		};

		if (regionIds) {

			countryFilter.regions = regionIds.split("+");

		}

		countrySearch.push(countryFilter);

	}

	return filterLocations(countrySearch);

};

export const getGeography = ()
	: Promise<IGeoCountry[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.dataGeography && state.dataGeography.length) {

			resolve(state.dataGeography);

		} else {

			const apiCall = callApi(
				"get",
				"geography/countries",
			)
				.then((countryList: IGeoCountry[]) => {

					store.dispatch(actions.saveDataGeography(countryList));
					resolve(countryList);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const mapCountry = (
	data: IDBDerbyEvent | IDBDerbyVenue,
): IGeoCountry => ({
	code: data.country_code,
	flag: data.country_flag,
	name: data.country_name,
	regionType: data.country_region_type,
});

export const mapRegion = (
	data: IDBDerbyEvent | IDBDerbyVenue,
): IGeoRegion => ({
	abbreviation: data.region_abbreviation,
	country: data.region_country,
	id: data.region_id,
	name: data.region_name,
});
