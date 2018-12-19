export interface IDBDerbyFeature {
	feature_abbreviation: string;
	feature_id: number;
	feature_name: string;
	feature_order: number;
	feature_type: number;
}

export interface IDBDerbyFeatureType {
	feature_type_code: string;
	feature_type_id: number;
	feature_type_name_plural: string;
	feature_type_name_singular: string;
	feature_type_order: number;
}

export interface IDerbyFeature {
	abbreviation: string;
	id: number;
	name: string;
}

export interface IDerbyFeatureChange {
	name: string;
	status: "add" | "delete" | "unchanged";
}

export interface IDerbyFeatureChanges {
	[key: string]: IDerbyFeatureChangeType;
}

export interface IDerbyFeatureChangeType {
	features: IDerbyFeatureChange[];
	name: string;
}

export interface IDerbyFeatureType {
	code: string;
	features: IDerbyFeature[];
	order: number;
	plural: string;
	singular: string;
}
