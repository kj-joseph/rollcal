import express from "express";

import bodyParser from "body-parser";
import cors from "cors";

const logger = require("morgan");
const path = require("path");

import authRouter from "routes/auth";
import eventFeaturesRouter from "routes/eventFeatures";
import eventsRouter from "routes/events";
import geographyRouter from "routes/geography";
import indexRouter from "routes/index";
import venuesRouter from "routes/venues";

import { createPool } from "mysql";

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));

app.use((req, res, next) => {
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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/auth", authRouter);
app.use("/eventFeatures", eventFeaturesRouter);
app.use("/events", eventsRouter);
app.use("/geography", geographyRouter);
app.use("/venues", venuesRouter);

export default app;
