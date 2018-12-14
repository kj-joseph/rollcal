export interface IDBGeoCountry {
	country_code: string;
	country_name: string;
	country_flag: string;
	country_region_type?: string;
	disabled?: boolean;
}

export interface IDBGeoRegion {
	disabled?: boolean;
	region_id: number;
	region_country: string;
	region_name: string;
	region_abbreviation: string;
}

export interface IGeoCountry {
	code: string;
	disabled?: boolean;
	flag: string;
	name: string;
	regionType?: string;
	regions?: IGeoRegion[];
}

export interface IGeoCountryFilter {
	code: string;
	regions?: string[];
}

export interface IGeoRegion {
	abbreviation: string;
	country: string;
	disabled?: boolean;
	id: number;
	name: string;
}
