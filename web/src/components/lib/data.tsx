import { IDerbySanction, IDerbyTrack, IDerbyType } from "interfaces/feature";
import { IGeoCountry, IGeoData, IGeoRegionList, ITimeZone } from "interfaces/geo";
import { IUserRole } from "interfaces/user";

import actions from "redux/actions";
import store from "redux/store";

import { callApi } from "components/lib/api";

export const getDerbySanctions = (): Promise<IDerbySanction[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.dataSanctions && state.dataSanctions.length) {

			resolve(state.dataSanctions);

		} else {

			callApi("get", "eventFeatures/getSanctionTypes")

				.then((result: IDerbySanction[]) => {

					store.dispatch(actions.saveDataSanctions(result));
					resolve(result);

				}).catch((error) => {

					reject(error);

				});

		}

	});
};

export const getDerbyTracks = (): Promise<IDerbyTrack[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.dataTracks && state.dataTracks.length) {

			resolve(state.dataTracks);

		} else {

			callApi("get", "eventFeatures/getTracks")

				.then((result: IDerbyTrack[]) => {

					store.dispatch(actions.saveDataTracks(result));
					resolve(result);

				}).catch((error) => {

					reject(error);

				});

		}

	});
};

export const getDerbyTypes = (): Promise<IDerbyType[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.dataDerbyTypes && state.dataDerbyTypes.length) {

			resolve(state.dataDerbyTypes);

		} else {

			callApi("get", "eventFeatures/getDerbyTypes")

				.then((result: IDerbyType[]) => {

					store.dispatch(actions.saveDataDerbyTypes(result));
					resolve(result);

				}).catch((error) => {

					reject(error);

				});

		}

	});
};

export const getGeography = (): Promise<IGeoData> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.dataGeography
			&& state.dataGeography.countries && state.dataGeography.countries.length
			&& state.dataGeography.regions && Object.keys(state.dataGeography.regions).length > 0) {

			resolve({
				countries: state.dataGeography.countries,
				regions: state.dataGeography.regions,
			});

		} else {

			callApi("get", "geography/getAllCountries")

				.then((countries: IGeoCountry[]) => {

					const regions = {} as IGeoRegionList;
					const regionPromises: Array<Promise<void>> = [];

					for (let country = 0; country < countries.length; country ++) {
						if (countries[country].country_region_type) {
							regionPromises.push(new Promise((resolveRegions, rejectRegions) => {

								callApi("get", `geography/getRegionsByCountry/${countries[country].country_code}`)

									.then((resultRegions) => {

										if (resultRegions.length) {
											regions[countries[country].country_code] = resultRegions;
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

							store.dispatch(actions.saveDataGeography({
								countries,
								regions,
							}));

							resolve({
								countries,
								regions,
							});

						}).catch((error) => {

							reject(error);

						});

					} else {

						store.dispatch(actions.saveDataGeography({
							countries,
							regions,
						}));

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

export const getTimeZones = (): Promise<ITimeZone[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.timeZones && state.timeZones.length) {

			resolve(state.timeZones);

		} else {

			callApi("get", "geography/getAllCountries")

				.then((result: ITimeZone[]) => {

					store.dispatch(actions.saveTimeZones(result));
					resolve(result);

				}).catch((error) => {

					reject(error);

				});
		}

	});
};

export const getUserRoles = (): Promise<IUserRole[]> => {

	return new Promise((resolve, reject) => {
		const state = store.getState();

		if (state.rolesList && state.rolesList.length) {

			resolve(state.rolesList);

		} else {

			callApi("get", "user/getRolesList")

				.then((result: IUserRole[]) => {

					store.dispatch(actions.saveRolesList(
							result.filter((role) => role.name !== "superadmin")));

					resolve(result.filter((role) => role.name !== "superadmin"));

				}).catch((error) => {

					reject(error);

				});
		}

	});
};
