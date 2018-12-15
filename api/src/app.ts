import express, { Request, Response } from "express";
import mysqlSession from "express-mysql-session";
const session = require("express-session");

import bodyParser from "body-parser";
import cors from "cors";

const logger = require("morgan");
const path = require("path");

import emailRouter from "routes/email";
import eventRouter from "routes/event";
import eventChangeRouter from "routes/eventChange";
import eventChangesRouter from "routes/eventChanges";
import eventsRouter from "routes/events";
import featureRouter from "routes/feature";
import forgotPasswordRouter from "routes/forgotPassword";
import geographyRouter from "routes/geography";
import rolesRouter from "routes/roles";
import sessionRouter from "routes/session";
import timezonesRouter from "routes/timezones";
import userRouter from "routes/user";
import usersRouter from "routes/users";
import validationRouter from "routes/validation";
import venueRouter from "routes/venue";
import venueChangeRouter from "routes/venueChange";
import venueChangesRouter from "routes/venueChanges";
import venuesRouter from "routes/venues";

import { createPool } from "mysql";

let app: express.Application;

if ((process.env.ROLLCAL_DEV_DBHOST || process.env.ROLLCAL_STAGE_DBHOST || process.env.ROLLCAL_PROD_DBHOST)
	&& (process.env.ROLLCAL_DEV_DBNAME || process.env.ROLLCAL_STAGE_DBNAME || process.env.ROLLCAL_PROD_DBNAME)
	&& (process.env.ROLLCAL_DEV_DBPASS || process.env.ROLLCAL_STAGE_DBPASS || process.env.ROLLCAL_PROD_DBPASS)
	&& (process.env.ROLLCAL_DEV_DBUSER || process.env.ROLLCAL_STAGE_DBUSER || process.env.ROLLCAL_PROD_DBUSER)
	&& (process.env.ROLLCAL_DEV_SECRET || process.env.ROLLCAL_STAGE_SECRET || process.env.ROLLCAL_PROD_SECRET)
	&& process.env.ROLLCAL_ALLOW_ORIGIN
	) {

	app = express();

	app.use(cors({
		credentials: true,
		origin: true,
	}));

	app.disable("x-powered-by");

	app.use((req: Request, res: Response, next: any) => {
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Access-Control-Allow-Origin", process.env.ROLLCAL_ALLOW_ORIGIN);
		res.header("Access-Control-Allow-Headers", "Content-Type");
		next();
	});

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, "public")));

	app.use(logger("dev"));

	const dbSettings = {
		connectionLimit: 50,
		database: process.env.ROLLCAL_DEV_DBNAME || process.env.ROLLCAL_STAGE_DBNAME || process.env.ROLLCAL_PROD_DBNAME,
		host: process.env.ROLLCAL_DEV_DBHOST || process.env.ROLLCAL_STAGE_DBHOST || process.env.ROLLCAL_PROD_DBHOST,
		multipleStatements: true,
		password: process.env.ROLLCAL_DEV_DBPASS || process.env.ROLLCAL_STAGE_DBPASS || process.env.ROLLCAL_PROD_DBPASS,
		timezone: "utc",
		user: process.env.ROLLCAL_DEV_DBUSER || process.env.ROLLCAL_STAGE_DBUSER || process.env.ROLLCAL_PROD_DBUSER,
	};

	const dbPool = createPool(dbSettings);

	app.use((req: Request, res: Response, next: any) => {
		res.locals.connection = createPool(dbSettings);
		next();
	});

	const mysqlStore = mysqlSession(session);
	const sessionStore = new mysqlStore({}, dbPool);

	app.use(session({
		key: "rollCalAuthCookie",
		resave: false,
		saveUninitialized: true,
		secret: process.env.ROLLCAL_DEV_SECRET || process.env.ROLLCAL_STAGE_SECRET || process.env.ROLLCAL_PROD_SECRET,
		store: sessionStore,
	}));

	app.use("/email", emailRouter);
	app.use("/feature", featureRouter);

	app.use("/event", eventRouter);
	app.use("/events", eventsRouter);

	app.use("/event-change", eventChangeRouter);
	app.use("/event-changes", eventChangesRouter);

	app.use("/geography", geographyRouter);

	app.use("/roles", rolesRouter);

	app.use("/timezones", timezonesRouter);

	app.use("/session", sessionRouter);

	app.use("/user", userRouter);
	app.use("/users", usersRouter);

	app.use("/forgot-password", forgotPasswordRouter);

	app.use("/validation", validationRouter);

	app.use("/venue", venueRouter);
	app.use("/venues", venuesRouter);

	app.use("/venue-change", venueChangeRouter);
	app.use("/venue-changes", venueChangesRouter);

} else {
	console.error("ERROR: Environment variables missing.");
}

export default app;
