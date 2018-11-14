BEGIN

select v.*,
	c.country_name, c.country_flag,
	r.region_abbreviation, r.region_name
from venues v
	left join regions r
    	on v.venue_region = r.region_id
    left join countries c
    	on v.venue_country = c.country_code
where venue_id = id;

END
