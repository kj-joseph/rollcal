import express, { Request, Response } from "express";
import mysqlSession from "express-mysql-session";
const session = require("express-session");

import bodyParser from "body-parser";
import cors from "cors";

const logger = require("morgan");
const path = require("path");

import adminRouter from "routes/admin";
import contactRouter from "routes/contact";
import eventFeaturesRouter from "routes/eventFeatures";
import eventsRouter from "routes/events";
import geographyRouter from "routes/geography";
import userRouter from "routes/user";
import venuesRouter from "routes/venues";

import { createPool } from "mysql";

let app: express.Application;

if ((process.env.ROLLCAL_DEV_DBHOST || process.env.ROLLCAL_STAGE_DBHOST || process.env.ROLLCAL_DBHOST)
	&& (process.env.ROLLCAL_DEV_DBNAME || process.env.ROLLCAL_STAGE_DBNAME || process.env.ROLLCAL_DBNAME)
	&& (process.env.ROLLCAL_DEV_DBPASS || process.env.ROLLCAL_STAGE_DBPASS || process.env.ROLLCAL_DBPASS)
	&& (process.env.ROLLCAL_DEV_DBUSER || process.env.ROLLCAL_STAGE_DBUSER || process.env.ROLLCAL_DBUSER)
	&& (process.env.ROLLCAL_DEV_SECRET || process.env.ROLLCAL_STAGE_SECRET || process.env.ROLLCAL_SECRET)
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

	app.use("/admin", adminRouter);
	app.use("/contact", contactRouter);
	app.use("/eventFeatures", eventFeaturesRouter);
	app.use("/events", eventsRouter);
	app.use("/geography", geographyRouter);
	app.use("/user", userRouter);
	app.use("/venues", venuesRouter);

}

export default app;
