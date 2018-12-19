import actions from "redux/actions";
import store from "redux/store";
import { callApi } from "services/apiService";

import { IDerbyFeature, IDerbyFeatureType } from "interfaces/feature";

export const findFeatureByString = (
	featureString: string,
): IDerbyFeature => {

	const state = store.getState();

	if (!featureString
		|| !featureString.search("-")
		|| !state.featureLists
		|| !state.featureLists.length) {

		return undefined;

	}

	const [type, id] = featureString.split("-");

	const featureType = state.featureLists
		.filter((ftype) =>
			ftype.code === type)[0];

	if (!featureType) {

		return undefined;

	}

	return featureType.features
		.filter((feature) =>
			feature.id.toString() === id)[0];

};

export const getFeatures = ()
	: Promise<IDerbyFeatureType[]> =>

	new Promise((resolve, reject, onCancel) => {

		const state = store.getState();

		if (state.featureLists && state.featureLists.length) {

			resolve(state.featureLists);

		} else {

			const apiCall = callApi(
				"get",
				"features",
			)
				.then((response) => {

					const featureTypes: IDerbyFeatureType[] = response.data;

					store.dispatch(actions.saveFeatureLists(featureTypes));
					resolve(featureTypes);

				})
				.catch((error) => {

					reject(error);

				});

			onCancel(() => {
				apiCall.cancel();
			});

		}

	});

export const mapFeatures = (
	selectedFeatureLists: {
		[key: string]: string[],
	},
): Promise<IDerbyFeatureType[]> =>

	new Promise((resolve, reject, onCancel) => {

		const featureFilters = getFeatures()
			.then((featureLists) => {

				const selectedFeatures: IDerbyFeatureType[] = [];

				for (const featureType in selectedFeatureLists) {
					if (selectedFeatureLists.hasOwnProperty(featureType)) {

						const type = Object.assign({},
							featureLists
								.filter((ft) =>
									ft.code === featureType)[0]);

						type.features = featureLists
								.filter((ft) =>
									ft.code === featureType)[0].features
										.filter((feature) =>
											selectedFeatureLists[featureType].indexOf(feature.id.toString()) > -1);

						selectedFeatures.push(type);

					}
				}

				resolve (selectedFeatures
					.sort((a, b) =>
						a.order > b.order ? 1
						: a.order < b.order ? -1
						: 0));

			});

		onCancel(() => {
			featureFilters.cancel();
		});

	});

export const mapFeaturesFromText = (
	featureStrings: string[],
): Promise<IDerbyFeatureType[]> =>

	new Promise((resolve, reject, onCancel) => {

		const featureMap =
			mapFeatures(mapFeaturesToArrays(featureStrings))
				.then((features) =>
					resolve(features));

		onCancel(() => {
			featureMap.cancel();
		});

	});

export const mapFeaturesToArrays = (
	featureStrings: string[],
): {
	[key: string]: string[],
} => {

	const eventFeatures: {
		[key: string]: string[],
	} = {};

	for (const feature of featureStrings) {

		const [type, value] = feature.split("-");

		if (!eventFeatures[type]) {

			eventFeatures[type] = [value];

		} else {

			eventFeatures[type].push(value);

		}

	}

	return eventFeatures;

};
