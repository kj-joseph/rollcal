import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { IDBDerbySanction, IDBDerbyTrack, IDBDerbyType, IDerbyFeature } from "interfaces/feature";

export const filterDerbyTypes = (
	derbytypes: string[],
): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getData = getDerbyTypes()
			.then((derbytypeList) => {
				resolve (derbytypeList.filter((derbytype) =>
					derbytypes.indexOf(derbytype.id.toString()) > -1));
			});

		onCancel(() => {
			getData.cancel();
		});

	});

export const filterSanctions = (
	sanctions: string[],
): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getData = getDerbySanctions()
			.then((sanctionList) => {
				resolve (sanctionList.filter((sanction) =>
					sanctions.indexOf(sanction.id.toString()) > -1));
			});

		onCancel(() => {
			getData.cancel();
		});

	});

export const filterTracks = (
	tracks: string[],
): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const getData = getDerbyTracks()
			.then((trackList) => {
				resolve (trackList.filter((track) =>
					tracks.indexOf(track.id.toString()) > -1));
			});

		onCancel(() => {
			getData.cancel();
		});

	});

export const getDerbySanctions = (): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.dataSanctions && state.dataSanctions.length) {

			resolve(state.dataSanctions);

		} else {

			const apiCall = callApi(
				"get",
				"eventFeatures/getSanctionTypes",
			)
				.then((result: IDBDerbySanction[]) => {

					const sanctions: IDerbyFeature[] = result.map((sanction) => ({
						abbreviation: sanction.sanction_abbreviation,
						id: sanction.sanction_id,
						name: sanction.sanction_name,
					}));

					store.dispatch(actions.saveDataSanctions(sanctions));
					resolve(sanctions);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const getDerbyTracks = (): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.dataTracks && state.dataTracks.length) {

			resolve(state.dataTracks);

		} else {

			const apiCall = callApi(
				"get",
				"eventFeatures/getTracks",
			)
				.then((result: IDBDerbyTrack[]) => {

					const tracks: IDerbyFeature[] = result.map((track) => ({
						abbreviation: track.track_abbreviation,
						id: track.track_id,
						name: track.track_name,
					}));

					store.dispatch(actions.saveDataTracks(tracks));
					resolve(tracks);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const getDerbyTypes = (): Promise<IDerbyFeature[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.dataDerbyTypes && state.dataDerbyTypes.length) {

			resolve(state.dataDerbyTypes);

		} else {

			const apiCall = callApi(
				"get",
				"eventFeatures/getDerbyTypes",
			)
				.then((result: IDBDerbyType[]) => {

					const derbytypes: IDerbyFeature[] = result.map((derbytype) => ({
						abbreviation: derbytype.derbytype_abbreviation,
						id: derbytype.derbytype_id,
						name: derbytype.derbytype_name,
					}));

					store.dispatch(actions.saveDataDerbyTypes(derbytypes));
					resolve(derbytypes);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});
