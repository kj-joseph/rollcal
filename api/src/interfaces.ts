import { Request } from "express";

export interface IDBVenueAddress {
	country_flag: string;
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
