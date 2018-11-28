import { Request } from "express";

export interface IGeocode {
	lat: number;
	lng: number;
}

export interface IRequestWithSession extends Request {
	session: {
		[key: string]: any;
	};
}

export interface IVenueAddress {
	country_name: string;
	region_abbreviation?: string;
	venue_address1: string;
	venue_address2?: string;
	venue_city: string;
	venue_postcode?: string;
}
