BEGIN

update venues
set venue_lat = lat,
	venue_lng = lng
where venue_id = id;

END
