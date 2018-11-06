BEGIN

declare exit handler for SQLEXCEPTION
	begin
		get diagnostics condition 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		select @sqlstate, @errno, @text;
		rollback;
	end;

start transaction;

select c.change_object,	c.changed_item_id, c.change_user, e.event_name, e.event_host, true
	into @changeObject, @eventId, @user, @eventName, @eventHost, @changeok
from changes c, events e
where c.change_id = changeId
	and c.changed_item_type = "event"
	and c.changed_item_id = e.event_id
	and c.change_status = "submitted";

if @changeok = true then

	set @dataJSON = json_extract(@changeObject, "$.data");
	set @daysJSON = json_extract(@changeObject, "$.days");
	set @featuresAddJSON = json_extract(@changeObject, "$.features.add");
	set @featuresDeleteJSON = json_extract(@changeObject, "$.features.delete");
	set @newVenueJSON = json_extract(@changeObject, "$.newVenueData");

	if @eventName is null then
		set @eventName = @eventHost;
	end if;


	-- Add venue

	if @newVenueJSON is not null then

		set @region = json_unquote(json_extract(@newVenueJSON, "$.region"));
		if @region = "null" then
			set @region = null;
		end if;

		set @address2 = json_unquote(json_extract(@newVenueJSON, "$.address2"));
		if @address2 = "null" then
			set @address2 = null;
		end if;

		set @postcode = json_unquote(json_extract(@newVenueJSON, "$.postcode"));
		if @postcode = "null" then
			set @postcode = null;
		end if;

		set @link = json_unquote(json_extract(@newVenueJSON, "$.link"));
		if @link = "null" then
			set @link = null;
		end if;

		set @description = json_unquote(json_extract(@newVenueJSON, "$.description"));
		if @description = "null" then
			set @description = null;
		end if;

		insert into venues
			(venue_user, venue_name, venue_address1, venue_address2, venue_city, venue_country, venue_region, venue_postcode, venue_link, venue_description, venue_timezone)
		values (
			@user,
			json_unquote(json_extract(@newVenueJSON, "$.name")),
			json_unquote(json_extract(@newVenueJSON, "$.address1")),
			@address2,
			json_unquote(json_extract(@newVenueJSON, "$.city")),
			json_unquote(json_extract(@newVenueJSON, "$.country")),
			@region,
			@postcode,
			@link,
			@description,
			json_extract(@newVenueJSON, "$.timezone")
		);

		set @newVenueId = last_insert_id();

	end if;


	-- Event information

	if @eventId = 0 then

	-- New Event

		set @isNew = true;

		set @x = 0;
		set @insert = "event_user";
		set @values = @user;

		while @x < json_length(@dataJSON) do

			case json_unquote(json_extract(@dataJSON, concat("$[",@x,"].field")))

				when "description" then
					begin
						set @insert = concat(@insert, ", event_description");
						set @values = concat(@values, ", ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "host" then
					begin
						set @insert = concat(@insert, ", event_host");
						set @values = concat(@values, ", ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
						set @newHost = json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")));
					end;

				when "link" then
					begin
						set @insert = concat(@insert, ", event_link");
						set @values = concat(@values, ", ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "name" then
					begin
						set @insert = concat(@insert, ", event_name");
						set @values = concat(@values, ", ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
						set @newName = json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")));
					end;

				when "venue" then
					begin
						if @newVenueId is not null then
							set @insert = concat(@insert, ", event_venue");
							set @values = concat(@values, ", ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
						end if;
					end;

				else
					begin
					end;

			end case;

			set @x = @x + 1;

		end while;

		if @newVenueId is not null then
			set @insert = concat(@insert, ", event_venue");
			set @values = concat(@values, ", ", quote(@newVenueId));
		end if;

		set @query = concat(
			"insert into events",
			"(", @insert, ") values",
			"(", @values, ");");

		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;

		set @eventId = last_insert_id();

	elseif json_length(@dataJSON) > 0 then

	-- Existing event

		set @isNew = false;

		set @x = 0;
		set @values = "";

		while @x < json_length(@dataJSON) do

			case json_unquote(json_extract(@dataJSON, concat("$[",@x,"].field")))

				when "description" then
					begin
						if char_length(@values) > 0 then
							set @values = concat(@values, ", ");
						end if;
						set @values = concat(@values, "event_description = ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "host" then
					begin
						if char_length(@values) > 0 then
							set @values = concat(@values, ", ");
						end if;
						set @values = concat(@values, "event_host = ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "link" then
					begin
						if char_length(@values) > 0 then
							set @values = concat(@values, ", ");
						end if;
						set @values = concat(@values, "event_link = ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "name" then
					begin
						if char_length(@values) > 0 then
							set @values = concat(@values, ", ");
						end if;
						set @values = concat(@values, "event_name = ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
					end;

				when "venue" then
					begin
						if @newVenueId is not null then
							if char_length(@values) > 0 then
								set @values = concat(@values, ", ");
							end if;
							set @values = concat(@values, "event_venue = ", quote(json_unquote(json_extract(@dataJSON, concat("$[",@x,"].value")))));
						end if;
					end;

					else
						begin
						end;

			end case;

			set @x = @x + 1;

		end while;

		if @newVenueId is not null then
			if char_length(@values) > 0 then
				set @values = concat(@values, ", ");
			end if;
			set @values = concat(@values, "event_venue = ", quote(@newVenueId));
		end if;

		set @query = concat(
			"update events",
			" set ", @values,
			" where event_id = ", @eventId, ";");

		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;

	end if;


	-- Add Features

	if json_length(@featuresAddJSON) > 0 then

		set @x = 0;

		while @x < json_length(@featuresAddJSON) do

			set @featureItem = json_unquote(json_extract(@featuresAddJSON, concat("$[",@x,"]")));
			set @featureType = substring_index(@featureItem, "-", 1);
			set @featureId = substring_index(@featureItem, "-", -1);

			set @query = concat("insert into event_", @featureType, "s (event, ", @featureType, ") "
				"values (", quote(@eventId), ", ", quote(@featureId), ");");

			prepare stmt from @query;
			execute stmt;
			deallocate prepare stmt;

			set @x = @x + 1;

		end while;

	end if;

	-- Delete Features

	if json_length(@featuresDeleteJSON) > 0 then

		set @x = 0;

		while @x < json_length(@featuresDeleteJSON) do

			set @featureItem = json_unquote(json_extract(@featuresDeleteJSON, concat("$[",@x,"]")));
			set @featureType = substring_index(@featureItem, "-", 1);
			set @featureId = substring_index(@featureItem, "-", -1);

			set @query = concat("delete from event_", @featureType, "s ",
				"where ", @featureType, " = ", @featureId,
				" and event = ", @eventId, ";");

			prepare stmt from @query;
			execute stmt;
			deallocate prepare stmt;

			set @x = @x + 1;

		end while;

	end if;


	-- Days

	if json_length(@daysJSON) > 0 then

		set @x = 0;

		while @x < json_length(@daysJSON) do

			set @operation = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].operation")));

			case @operation

				when "add" then
					begin
						set @datetime = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.datetime")));
						set @description = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.description")));
						set @doors = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.doors")));

						if @datetime then
							if @datetime = "null" then
								set @datetime = null;
							end if;
						end if;

						if @description then
							if @description = "null" then
								set @dadescriptiontetime = null;
							end if;
						end if;

						if @doors then
							if @doors = "null" then
								set @doors = null;
							end if;
						end if;

						insert into eventdays
							(eventday_event, eventday_datetime, eventday_doors, eventday_description)
						values (
							@eventId,
							@datetime,
							@doors,
							@description
						);
					end;

				when "delete" then
					begin
						delete from eventdays
						where eventday_id = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].id")));
					end;

				when "change" then
					begin
						set @values = "";

						set @datetime = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.datetime")));
						set @description = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.description")));
						set @doors = json_unquote(json_extract(@daysJSON, concat("$[",@x,"].value.doors")));

						if @datetime is not null then
							if @datetime = "\"null\"" then
								set @datetime = null;
							end if;
							if char_length(@values) > 0 then
								set @values = concat(@values, ", ");
							end if;
							set @values = concat(@values, "eventday_datetime = ", quote(@datetime));
						end if;

						if @description is not null then
							if @description = "\"null\"" then
								set @description = null;
							end if;
							if char_length(@values) > 0 then
								set @values = concat(@values, ", ");
							end if;
							set @values = concat(@values, "eventday_description = ", quote(@description));
						end if;

						if @doors is not null then
							if @doors = "\"null\"" then
								set @doors = null;
							end if;
							if char_length(@values) > 0 then
								set @values = concat(@values, ", ");
							end if;
							set @values = concat(@values, "eventday_doors = ", quote(@doors));
						end if;

						set @query = concat("update eventdays set ",
							@values,
							" where eventday_id = ", quote(json_unquote(json_extract(@daysJSON, concat("$[",@x,"].id")))
						));

						prepare stmt from @query;
						execute stmt;
						deallocate prepare stmt;

					end;

				else
					begin
					end;

			end case;

			set @x = @x + 1;

		end while;

	end if;

	select count(eventday_id) as count
		into @eventdayCount
	from eventdays
	where eventday_event = @eventId;

	if @eventdayCount > 0 then

		if @newName is not null then
			set @eventName = @newName;
		elseif @eventName is null then
			set @eventName = @newHost;
		end if;

		update changes
		set change_status = "approved",
			change_reviewer = reviewer
		where change_id = changeId;

		select user_name, user_email
			into @username, @email
		from users
		where user_id = @user;

		select @username as username, @email as email, @user as user_id, @eventId as event_id, @eventName as event_name, @isNew as isNew;

		commit;

	else
		rollback;
	end if;

else

	select "Change not found." as error;

end if;

END
