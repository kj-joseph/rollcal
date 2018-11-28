const mapsClient = require("@google/maps").createClient({
	Promise,
	key: "AIzaSyAz8U0ZOitKZTSCIGFzqEIj2t0rQnAwPw4",
});

export const getGeocode = (address: string) =>
	mapsClient.geocode({
		address,
	}).asPromise()
		.then((response: any) => {
			return response.json.results[0].geometry.location;
		})
		.catch((error: Error) => {
			console.error(error);
		});
