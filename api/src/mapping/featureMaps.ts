import { IDBDerbyFeature, IDBDerbyFeatureType, IDerbyFeature, IDerbyFeatureType } from "interfaces/feature";

export const mapFeature = (
	featureData: IDBDerbyFeature,
): IDerbyFeature  => ({
	abbreviation: featureData.feature_abbreviation,
	id: featureData.feature_id,
	name: featureData.feature_name,
});

export const mapFeatureLists = (
	featureData: IDBDerbyFeature[],
	featureTypes: IDBDerbyFeatureType[],
): IDerbyFeatureType[]  =>

	featureTypes
		.map((typeData) => mapFeatureType(
			typeData,
			featureData
				.filter((feature) =>
					feature.feature_type === typeData.feature_type_id),
		))
		.filter((type) =>
			!!type.features.length);

export const mapFeatureType = (
	typeData: IDBDerbyFeatureType,
	featureData?: IDBDerbyFeature[],
): IDerbyFeatureType => ({
	code: typeData.feature_type_code,
	features: featureData
		.map((feature) =>
			mapFeature(feature)),
	order: typeData.feature_type_order,
	plural: typeData.feature_type_name_plural,
	singular: typeData.feature_type_name_singular,
});
