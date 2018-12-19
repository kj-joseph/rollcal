import { IDBDerbyEvent } from "interfaces/event";
import { IDBGeoCountry, IDBGeoRegion, IGeoCountry, IGeoRegion } from "interfaces/geo";
import { IDBDerbyVenue } from "interfaces/venue";

export const mapCountry = (
	data: IDBGeoCountry | IDBDerbyEvent | IDBDerbyVenue,
	regionData?: IDBGeoRegion[],
) => {

	const country: IGeoCountry = {
		code: data.country_code,
		flag: data.country_flag,
		name: data.country_name,
		regionType: data.country_region_type,
	};

	if (regionData && regionData.length) {
		country.regions = regionData
			.map((region) =>
				mapRegion(region));
	}

	return country;

};

export const mapGeography = (
	countryData: IDBGeoCountry[],
	regionData: IDBGeoRegion[],
) =>
	countryData
		.map((country) =>
			mapCountry(
				country,
				country.country_region_type ?
					regionData
						.filter((region) =>
							region.region_country === country.country_code)
				: undefined,
			));

export const mapRegion = (
	data: IDBGeoRegion | IDBDerbyEvent | IDBDerbyVenue,
): IGeoRegion => ({
	abbreviation: data.region_abbreviation,
	country: data.region_country,
	id: data.region_id,
	name: data.region_name,
});
