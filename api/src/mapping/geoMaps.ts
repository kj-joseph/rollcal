import { IDBGeoCountry, IDBGeoRegion, IGeoCountry, IGeoRegion } from "interfaces/geo";

export const mapCountry = (
	countryData: IDBGeoCountry,
	regionData?: IDBGeoRegion[],
) => {

	const country: IGeoCountry = {
		code: countryData.country_code,
		flag: countryData.country_flag,
		name: countryData.country_name,
		regionType: countryData.country_region_type,
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
	region: IDBGeoRegion,
): IGeoRegion => ({
	abbreviation: region.region_abbreviation,
	country: region.region_country,
	id: region.region_id,
	name: region.region_name,
});
