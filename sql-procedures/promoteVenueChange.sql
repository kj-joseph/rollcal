BEGIN

declare exit handler for SQLEXCEPTION
	begin
		get diagnostics condition 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		select @sqlstate, @errno, @text;
		rollback;
	end;

start transaction;

select c.change_object,	c.changed_item_id, c.change_user, true
	into @changeObject, @venueId, @user, @changeok
from changes c
where c.change_id = changeId
	and c.changed_item_type = "venue"
	and c.change_status = "submitted";

if @changeok = true then

	if @venueId = 0 then

	-- New venue

		set @address2 = json_unquote(json_extract(@changeObject, "$.address2"));
		if @address2 = "null" then
			set @address2 = null;
		end if;

		set @postcode = json_unquote(json_extract(@changeObject, "$.postcode"));
		if @postcode = "null" then
			set @postcode = null;
		end if;

		set @region = json_extract(@changeObject, "$.region");
		if @region = "null" then
			set @region = null;
		end if;

		set @region = json_extract(@changeObject, "$.region");
		if @region = "null" then
			set @region = null;
		end if;

		set @link = json_unquote(json_extract(@changeObject, "$.link"));
		if @link = "null" then
			set @link = null;
		end if;

		set @description = json_unquote(json_extract(@changeObject, "$.description"));
		if @description = "null" then
			set @description = null;
		end if;

		insert into venues
			(venue_user, venue_name, venue_address1, venue_address2, venue_city, venue_country, venue_region, venue_postcode, venue_link, venue_description, venue_timezone)
		values (
			@user,
			json_unquote(json_extract(@changeObject, "$.name")),
			json_unquote(json_extract(@changeObject, "$.address1")),
			@address2,
			json_unquote(json_extract(@changeObject, "$.city")),
			json_unquote(json_extract(@changeObject, "$.country")),
			@region,
			@postcode,
			@link,
			@description,
			json_extract(@changeObject, "$.timezone")
		);

		set @venueId = last_insert_id();

	else

	-- Existing venue

		set @update = "";

		set @name = json_unquote(json_extract(@changeObject, "$.name"));
		if @name is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @name = "null" then
				set @update = concat(@update, "venue_name = null");
			else
				set @update = concat(@update, "venue_name = '", @name, "'");
			end if;
		end if;

		set @address1 = json_unquote(json_extract(@changeObject, "$.address1"));
		if @address1 is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @address1 = "null" then
				set @update = concat(@update, "venue_address1 = null");
			else
				set @update = concat(@update, "venue_address1 = '", @address1, "'");
			end if;
		end if;

		set @address2 = json_unquote(json_extract(@changeObject, "$.address2"));
		if @address2 is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @address2 = "null" then
				set @update = concat(@update, "venue_address2 = null");
			else
				set @update = concat(@update, "venue_address2 = ", @address2, "'");
			end if;
		end if;

		set @city = json_unquote(json_extract(@changeObject, "$.city"));
		if @city is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @city = "null" then
				set @update = concat(@update, "venue_city = null");
			else
				set @update = concat(@update, "venue_city = '", @city, "'");
			end if;
		end if;

		set @country = json_unquote(json_extract(@changeObject, "$.country"));
		if @country is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @country = "null" then
				set @update = concat(@update, "venue_country = null");
			else
				set @update = concat(@update, "venue_country = ", @country);
			end if;
		end if;

		set @region = json_unquote(json_extract(@changeObject, "$.region"));
		if @region is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @region = "null" then
				set @update = concat(@update, "venue_region = null");
			else
				set @update = concat(@update, "venue_region = ", @region);
			end if;
		end if;

		set @postcode = json_unquote(json_extract(@changeObject, "$.postcode"));
		if @postcode is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @postcode = "null" then
				set @update = concat(@update, "venue_postcode = null");
			else
				set @update = concat(@update, "venue_postcode = '", @postcode, "'");
			end if;
		end if;

		set @link = json_unquote(json_extract(@changeObject, "$.link"));
		if @link is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @link = "null" then
				set @update = concat(@update, "venue_link = null");
			else
				set @update = concat(@update, "venue_link = ", @link);
			end if;
		end if;

		set @description = json_unquote(json_extract(@changeObject, "$.description"));
		if @description is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @description = "null" then
				set @update = concat(@update, "venue_description = null");
			else
				set @update = concat(@update, "venue_description = '", @description, "'");
			end if;
		end if;

		set @timezone = json_unquote(json_extract(@changeObject, "$.timezone"));
		if @timezone is not null then
			if char_length(@update) > 0 then
				set @update = concat(@update, ", ");
			end if;
			if @timezone = "null" then
				set @update = concat(@update, "venue_timezone = null");
			else
				set @update = concat(@update, "venue_timezone = ", @timezone);
			end if;
		end if;

		set @query = concat(
			"update values",
			" set ", @update,
			" where venue_id = ", @venueId, ";");

		-- select @query, @venueId;

		-- prepare stmt from @query;
		-- execute stmt;
		-- deallocate prepare stmt;

	end if;

	-- update changes
	-- set change_status = "approved"
	-- where change_id = changeId;

	-- select user_name, user_email
	-- 	into @username, @email
	-- from users
	-- where user_id = @user;

	-- select @username as username, @email as email, @user as user_id, @venueId as venue_id;

	-- commit;

else

	select "Change not found." as error;

end if;

END
