import React from "react";

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

import { IDerbySanction, IDerbyTrack, IDerbyType, IGeoCountry, IGeoData, IGeoRegionList, IUserInfo } from "components/interfaces";

export const getDerbySanctions = (appState: any): Promise<IDerbySanction[]> => {

	return new Promise((resolve, reject) => {

		if (appState.dataSanctions.length) {

			resolve(appState.dataSanctions);

		} else {

			axios.get(appState.apiLocation + "eventFeatures/getSanctionTypes")
				.then((result: AxiosResponse) => {
					appState.saveDataSanctions(result.data.response as IDerbySanction[]);
					resolve(result.data.response);
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

			axios.get(appState.apiLocation + "eventFeatures/getTracks")
				.then((result: AxiosResponse) => {
					appState.saveDataTracks(result.data.response as IDerbyTrack[]);
					resolve(result.data.response);
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

			axios.get(appState.apiLocation + "eventFeatures/getDerbyTypes")
				.then((result: AxiosResponse) => {
					appState.saveDataDerbyTypes(result.data.response as IDerbyType[]);
					resolve(result.data.response);
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

			axios.get(appState.apiLocation + "geography/getAllCountries")
				.then((result: AxiosResponse) => {

					const countries: IGeoCountry[] = result.data.response;
					const regions = {} as IGeoRegionList;
					const regionPromises: Array<Promise<void>> = [];

					for (let country = 0; country < countries.length; country ++) {
						if (countries[country].country_region_type) {
							regionPromises.push(new Promise((resolveRegions, rejectRegions) => {
								axios.get(appState.apiLocation + "geography/getRegionsByCountry/" + countries[country].country_code)
									.then((resultRegions: AxiosResponse) => {
										if (resultRegions.data.response.length) {
											regions[countries[country].country_code] = resultRegions.data.response;
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
