import { Request } from "express";

export interface IAddressObject {
	address1: string;
	city: string;
	country: string;
	postcode?: string;
	region?: string;
}

export interface IDBVenueAddress {
	country_name: string;
	region_abbreviation?: string;
	venue_address1: string;
	venue_city: string;
	venue_postcode?: string;
}

export interface IGeocode {
	lat: number;
	lng: number;
}

export interface IRequestWithSession extends Request {
	session: {
		[key: string]: any;
	};
}
