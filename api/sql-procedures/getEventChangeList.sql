BEGIN

select ch.change_id, ch.changed_item_id, ch.change_submitted, ch.change_object, ch.change_user,
	u.user_name as change_user_name,
    e.event_name, e.event_host,
    v.venue_city, c.country_code, r.region_abbreviation,
    ed.event_first_day, ed.event_last_day

from changes ch
	join users u
		on ch.change_user = u.user_id
	left join events e
		on ch.changed_item_id = e.event_id
	left join (select eventday_event, min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day from eventdays group by eventday_event) ed
		on ed.eventday_event = ch.changed_item_id
   	left join venues v
    	on e.event_venue = v.venue_id
    left join countries c
    	on v.venue_country = c.country_code
    left join regions r
    	on v.venue_region = r.region_id

where ch.changed_item_type = "event"
	and change_status = "submitted"
	and u.user_id != user

order by ch.change_submitted;

END
