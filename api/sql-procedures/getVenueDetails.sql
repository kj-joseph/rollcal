BEGIN

select v.*, c.*, r.*, tz.*, u.user_id, u.user_name
from venues v
	left join users u
		on v.venue_user = u.user_id
	left join regions r
    	on v.venue_region = r.region_id
    left join countries c
    	on v.venue_country = c.country_code
    left join timezones tz
    	on v.venue_timezone = tz.timezone_id
where venue_id = id;

END
