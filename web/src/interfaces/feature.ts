export interface IDerbyFeatures {
	derbytypes: IDerbyType[];
	sanctions: IDerbySanction[];
	tracks: IDerbyTrack[];
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

export interface IDerbySanction {
	title: string;
	sanction_abbreviation: string;
	sanction_id: number;
	sanction_name: string;
}

export interface IDerbyTrack {
	title: string;
	track_abbreviation: string;
	track_id: number;
	track_name: string;
}

export interface IDerbyType {
	title: string;
	derbytype_abbreviation: string;
	derbytype_id: number;
	derbytype_name: string;
}
