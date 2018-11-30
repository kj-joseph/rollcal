export interface IDBDerbyVenue {
	country_code?: string;
	country_flag?: string;
	country_name?: string;
	region_abbreviation?: string;
	region_name?: string;
	venue_address1: string;
	venue_address2?: string;
	venue_city: string;
	venue_country: string;
	venue_description?: string;
	venue_id: number;
	venue_lat?: number;
	venue_link?: string;
	venue_lng?: number;
	venue_name: string;
	venue_postcode?: string;
	venue_region?: number;
	venue_timezone: number;
	venue_user: number;
}

export interface IDBDerbyVenueChange extends IDBDerbyVenue {
	change_id: number;
	change_object: string;
	change_submitted: string;
	change_user: number;
	change_user_name: string;
	changed_item_id: number;
}

export interface IDerbyVenue {
	address1: string;
	address2: string;
	city: string;
	country: string;
	countryName?: string;
	description?: string;
	id: number;
	link?: string;
	location?: string;
	name: string;
	postcode: string;
	region: number | string;
	timezone: number | string;
	user?: number;
}

export interface IDerbyVenueChange extends IDerbyVenue {
	changeId: number;
	changedItemId: number;
	submittedDuration: string;
	submittedTime: string;
	username: string;
	userId?: number;
}

export interface IDerbyVenueChangeObject {
	address1?: string;
	address2?: string;
	city?: string;
	country?: string;
	description?: string;
	link?: string;
	location?: string;
	name?: string;
	postcode?: string;
	region?: number | string;
	timezone?: number | string;
}

export interface INewDerbyVenue {
	address1: string;
	address2?: string;
	city?: string;
	country?: string;
	description: string;
	link: string;
	location?: string;
	name: string;
	postcode: string;
	region?: number | string;
	timezone: number | string;

}
