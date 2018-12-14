export interface IDBDerbySanction {
	sanction_abbreviation: string;
	sanction_id: number;
	sanction_name: string;
}

export interface IDBDerbyTrack {
	track_abbreviation: string;
	track_id: number;
	track_name: string;
}

export interface IDBDerbyType {
	derbytype_abbreviation: string;
	derbytype_id: number;
	derbytype_name: string;
}

export interface IDerbyFeature {
	abbreviation: string;
	id: number;
	name: string;
}

export interface IDerbyFeatures {
	derbytypes: IDerbyFeature[];
	sanctions: IDerbyFeature[];
	tracks: IDerbyFeature[];
}

export interface IDerbyIcon {
	filename: string;
	title: string;
}

export interface IDerbyIcons {
	derbytypes: IDerbyIcon[];
	sanctions: IDerbyIcon[];
	tracks: IDerbyIcon[];
}

