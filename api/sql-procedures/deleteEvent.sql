BEGIN

declare exit handler for SQLEXCEPTION
	begin
		get diagnostics condition 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		select @sqlstate, @errno, @text;
		rollback;
	end;

start transaction;

select event_user
	into @event_user
from events
where event_id = user;

if @event_user = user then

	delete from event_derbytypes
		where event = id;

	delete from event_sanctions
		where event = id;

	delete from event_tracks
		where event = id;

	delete from eventdays
		where eventday_event = id;

	delete from events
		where event_id = id;

	delete from changes
		where changed_item_id = id
			and changed_item_type = "event";

	commit;

	select true as deleted;

else

	select "User ID mismatch" as error;

end if;

END
