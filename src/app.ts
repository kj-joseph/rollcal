import express, { Request, Response, Router } from "express";
import mysqlSession from "express-mysql-session";
const session = require("express-session");

import bodyParser from "body-parser";
import cors from "cors";

const logger = require("morgan");
const path = require("path");

import eventFeaturesRouter from "routes/eventFeatures";
import eventsRouter from "routes/events";
import geographyRouter from "routes/geography";
import updateEventsRouter from "routes/updateEvents";
import userRouter from "routes/user";
import venuesRouter from "routes/venues";

import { createPool } from "mysql";

const app = express();

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

const dbPool = createPool({
	connectionLimit: 50,
	database: process.env.ROLLCAL_DB_DATABASE,
	host: process.env.ROLLCAL_DB_HOST,
	password: process.env.ROLLCAL_DB_PASSWORD,
	timezone: "utc",
	user: process.env.ROLLCAL_DB_USER,
});

app.use((req: Request, res: Response, next: any) => {
	res.locals.connection = createPool({
	connectionLimit: 50,
	database: process.env.ROLLCAL_DB_DATABASE,
	host: process.env.ROLLCAL_DB_HOST,
	password: process.env.ROLLCAL_DB_PASSWORD,
	timezone: "utc",
	user: process.env.ROLLCAL_DB_USER,
});
	next();
});

const mysqlStore = mysqlSession(session);
const sessionStore = new mysqlStore({}, dbPool);

app.use(session({
	key: "rollCalAuthCookie",
	resave: false,
	saveUninitialized: true,
	secret: process.env.ROLLCAL_API_SECRET,
	store: sessionStore,
}));

app.use("/eventFeatures", eventFeaturesRouter);
app.use("/events", eventsRouter);
app.use("/events/update", updateEventsRouter);
app.use("/geography", geographyRouter);
app.use("/user", userRouter);
app.use("/venues", venuesRouter);

export default app;
