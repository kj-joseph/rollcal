import axios, { AxiosResponse } from "axios";

import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoCountry, IGeoData, IGeoRegionList, ITimeZone } from "interfaces/geo";

export const getDerbySanctions = (appState: any): Promise<IDerbySanction[]> => {

	return new Promise((resolve, reject) => {

		if (appState.dataSanctions.length) {

			resolve(appState.dataSanctions);

		} else {

			axios.get(`${appState.apiLocation}eventFeatures/getSanctionTypes`, { withCredentials: true })
				.then((result: AxiosResponse) => {
					appState.saveDataSanctions(result.data as IDerbySanction[]);
					resolve(result.data as IDerbySanction[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getDerbyTracks = (appState: any): Promise<IDerbyTrack[]> => {

	return new Promise((resolve, reject) => {

		if (appState.dataTracks.length) {

			resolve(appState.dataTracks);

		} else {

			axios.get(`${appState.apiLocation}eventFeatures/getTracks`, { withCredentials: true })
				.then((result: AxiosResponse) => {
					appState.saveDataTracks(result.data as IDerbyTrack[]);
					resolve(result.data as IDerbyTrack[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getDerbyTypes = (appState: any): Promise<IDerbyType[]> => {

	return new Promise((resolve, reject) => {

		if (appState.dataDerbyTypes.length) {

			resolve(appState.dataDerbyTypes);

		} else {

			axios.get(`${appState.apiLocation}eventFeatures/getDerbyTypes`, { withCredentials: true })
				.then((result: AxiosResponse) => {
					appState.saveDataDerbyTypes(result.data as IDerbyType[]);
					resolve(result.data as IDerbyType[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getGeography = (appState: any): Promise<IGeoData> => {

	return new Promise((resolve, reject) => {

		if (appState.dataGeography.countries.length && Object.keys(appState.dataGeography.regions).length > 0) {

			resolve({
				countries: appState.dataGeography.countries,
				regions: appState.dataGeography.regions,
			});

		} else {

			axios.get(`${appState.apiLocation}geography/getAllCountries`, { withCredentials: true })
				.then((result: AxiosResponse) => {

					const countries: IGeoCountry[] = result.data;
					const regions = {} as IGeoRegionList;
					const regionPromises: Array<Promise<void>> = [];

					for (let country = 0; country < countries.length; country ++) {
						if (countries[country].country_region_type) {
							regionPromises.push(new Promise((resolveRegions, rejectRegions) => {
								axios.get(appState.apiLocation + "geography/getRegionsByCountry/" + countries[country].country_code,
									{ withCredentials: true })
									.then((resultRegions: AxiosResponse) => {
										if (resultRegions.data.length) {
											regions[countries[country].country_code] = resultRegions.data;
										}
										resolveRegions();
									});
							}));
						}
					}

					if (regionPromises.length) {

						Promise.all(regionPromises).then(() => {
							appState.saveDataGeography({
								countries,
								regions,
							});
							resolve({
								countries,
								regions,
							});
						});

					} else {

						appState.saveDataGeography({
							countries,
							regions,
						});
						resolve({
							countries,
							regions,
						});

					}

				}).catch((error) => {
					reject(error);
				});
		}

	});

};

export const getTimeZones = (appState: any): Promise<ITimeZone[]> => {

	return new Promise((resolve, reject) => {

		if (appState.timeZones.length) {

			resolve(appState.timeZones);

		} else {

			axios.get(`${appState.apiLocation}geography/getTimeZones`, { withCredentials: true })
				.then((result: AxiosResponse) => {
					appState.saveTimeZones(result.data as ITimeZone[]);
					resolve(result.data as ITimeZone[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};
