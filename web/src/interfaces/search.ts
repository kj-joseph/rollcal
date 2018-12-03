import { IDerbyFeature } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";

export interface ISearchObject {
	address?: string;
	derbytypes?: IDerbyFeature[];
	distance?: number;
	distanceUnits?: "mi" | "km";
	endDate?: string;
	locations?: IGeoCountry[];
	sanctions?: IDerbyFeature[];
	startDate?: string;
	tracks?: IDerbyFeature[];
	user?: number;
}
