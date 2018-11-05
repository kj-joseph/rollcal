BEGIN

select ch.change_id, ch.changed_item_id, ch.change_submitted, ch.change_object,
	u.user_name, u.user_id,
    v.venue_name, v.venue_city, c.country_code, r.region_abbreviation

from changes ch
	join users u
		on ch.change_user = u.user_id
    join venues v
		on ch.changed_item_id = v.venue_id
    join countries c
    	on v.venue_country = c.country_code
    left join regions r
    	on v.venue_region = r.region_id

where ch.changed_item_type = "venue"
	and change_status = "submitted"
	and u.user_id != user

order by ch.change_submitted;

END
