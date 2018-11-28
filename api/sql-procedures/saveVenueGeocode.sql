BEGIN

update venues
set venue_lat = lat,
	venue_lon = lon
where venue_id = id;

END
