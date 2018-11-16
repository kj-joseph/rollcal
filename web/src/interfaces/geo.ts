export interface IGeoCountry {
	country_code: string;
	country_name: string;
	country_flag: string;
	country_region_type?: string;
	disabled?: boolean;
}

export interface IGeoData {
	countries: IGeoCountry[];
	regions: IGeoRegionList;
}

export interface IGeoRegion {
	disabled?: boolean;
	region_id: number;
	region_country: string;
	region_name: string;
	region_abbreviation: string;
}

export interface IGeoRegionList {
	[key: string]: IGeoRegion[];
}

export interface ITimeZone {
	timezone_id: number;
	timezone_name: string;
	timezone_zone: string;
}
