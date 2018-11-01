BEGIN

declare timezone varchar(128);

select tz.timezone_zone
    into timezone
    from events e, venues v, timezones tz
    where e.event_id = id
        and e.event_venue = v.venue_id
        and v.venue_timezone = tz.timezone_id;

select ed.*,
    convert_tz(eventday_datetime, 'UTC', timezone) as eventday_start_venue,
    convert_tz(eventday_doors, 'UTC', timezone) as eventday_doors_venue
from eventdays ed
where eventday_event = id;

END
