import axios, { CancelTokenSource } from "axios";

import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoCountry, IGeoData, IGeoRegionList, ITimeZone } from "interfaces/geo";
import { IUserRole } from "interfaces/user";

export const getDerbySanctions = (
	apiLocation: string,
	dataSanctions: IDerbySanction[],
	saveDataSanctions: (data: IDerbySanction[]) => void,
	axiosSignal: CancelTokenSource,
): Promise<IDerbySanction[]> => {

	return new Promise((resolve, reject) => {

		if (dataSanctions && dataSanctions.length) {

			resolve(dataSanctions);

		} else {

			axios.get(`${apiLocation}eventFeatures/getSanctionTypes`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {
					saveDataSanctions(result.data as IDerbySanction[]);
					resolve(result.data as IDerbySanction[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getDerbyTracks = (
	apiLocation: string,
	dataTracks: IDerbyTrack[],
	saveDataTracks: (data: IDerbyTrack[]) => void,
	axiosSignal: CancelTokenSource,
): Promise<IDerbyTrack[]> => {

	return new Promise((resolve, reject) => {

		if (dataTracks && dataTracks.length) {

			resolve(dataTracks);

		} else {

			axios.get(`${apiLocation}eventFeatures/getTracks`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {
					saveDataTracks(result.data as IDerbyTrack[]);
					resolve(result.data as IDerbyTrack[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getDerbyTypes = (
	apiLocation: string,
	dataDerbyTypes: IDerbyType[],
	saveDataDerbyTypes: (data: IDerbyType[]) => void,
	axiosSignal: CancelTokenSource,
): Promise<IDerbyType[]> => {

	return new Promise((resolve, reject) => {

		if (dataDerbyTypes && dataDerbyTypes.length) {

			resolve(dataDerbyTypes);

		} else {

			axios.get(`${apiLocation}eventFeatures/getDerbyTypes`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {
					saveDataDerbyTypes(result.data as IDerbyType[]);
					resolve(result.data as IDerbyType[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getGeography = (
	apiLocation: string,
	dataGeography: IGeoData,
	saveDataGeography: (data: IGeoData) => void,
	axiosSignal: CancelTokenSource,
): Promise<IGeoData> => {

	return new Promise((resolve, reject) => {

		if (dataGeography
			&& dataGeography.countries && dataGeography.countries.length
			&& dataGeography.regions && Object.keys(dataGeography.regions).length > 0) {

			resolve({
				countries: dataGeography.countries,
				regions: dataGeography.regions,
			});

		} else {

			axios.get(`${apiLocation}geography/getAllCountries`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {

					const countries: IGeoCountry[] = result.data;
					const regions = {} as IGeoRegionList;
					const regionPromises: Array<Promise<void>> = [];

					for (let country = 0; country < countries.length; country ++) {
						if (countries[country].country_region_type) {
							regionPromises.push(new Promise((resolveRegions, rejectRegions) => {

								axios.get(apiLocation + "geography/getRegionsByCountry/" + countries[country].country_code,
									{
										cancelToken: axiosSignal.token,
										withCredentials: true,
									})
									.then((resultRegions) => {

										if (resultRegions.data.length) {
											regions[countries[country].country_code] = resultRegions.data;
										}
										resolveRegions();

									}).catch((error) => {
										rejectRegions(error);
									});
							}));
						}
					}

					if (regionPromises.length) {

						Promise.all(regionPromises).then(() => {
							saveDataGeography({
								countries,
								regions,
							});
							resolve({
								countries,
								regions,
							});
						}).catch(() => {
							reject();
						});

					} else {

						saveDataGeography({
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

export const getTimeZones = (
	apiLocation: string,
	dataTimeZones: ITimeZone[],
	saveTimeZones: (data: ITimeZone[]) => void,
	axiosSignal: CancelTokenSource,
): Promise<ITimeZone[]> => {

	return new Promise((resolve, reject) => {

		if (dataTimeZones && dataTimeZones.length) {

			resolve(dataTimeZones);

		} else {

			axios.get(`${apiLocation}geography/getTimeZones`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {
					saveTimeZones(result.data as ITimeZone[]);
					resolve(result.data as ITimeZone[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};

export const getUserRoles = (
	apiLocation: string,
	dataRolesList: IUserRole[],
	saveRolesList: (data: IUserRole[]) => void,
	axiosSignal: CancelTokenSource,
): Promise<IUserRole[]> => {

	return new Promise((resolve, reject) => {

		if (dataRolesList && dataRolesList.length) {

			resolve(dataRolesList);

		} else {

			axios.get(`${apiLocation}user/getRolesList`,
				{
					cancelToken: axiosSignal.token,
					withCredentials: true,
				})
				.then((result) => {
					saveRolesList(result.data.filter((role: IUserRole) => role.name !== "superadmin") as IUserRole[]);
					resolve(result.data.filter((role: IUserRole) => role.name !== "superadmin") as IUserRole[]);
				}).catch((error) => {
					reject(error);
				});
		}

	});
};
