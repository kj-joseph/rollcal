BEGIN

select c.change_user, v.venue_name, c.changed_item_id, c.change_object, true
	into @user, @venueName, @venueId, @changeObject, @changeok
from changes c
	left join venues v
		on c.changed_item_id = v.venue_id
where c.change_id = changeId
	and c.changed_item_type = "venue"
	and c.change_status = "submitted";

if @venueName is null then
	set @venueName = json_unquote(json_extract(@changeObject, "$.name"));
	set @isNew = true;
else
	set @isNew = false;
end if;

if @changeok = true then

	update changes
	set change_status = "rejected",
		change_reviewer = reviewer,
		change_comment = comment
	where change_id = changeId;

	select user_name, user_email
		into @username, @email
	from users
	where user_id = @user;

	select @username as username, @email as email, @user as user_id, @venueName as venue_name, @venueId as venue_id, @isNew as isNew;

else

	select "Change not found." as error;

end if;

END
