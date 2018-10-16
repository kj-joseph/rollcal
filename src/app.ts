import express, { Request, Response, Router } from "express";

import bodyParser from "body-parser";
import cors from "cors";

const logger = require("morgan");
const path = require("path");

import exjwt from "express-jwt";
import jperm from "express-jwt-permissions";
import jwt from "jsonwebtoken";

import authRouter from "routes/auth";
import eventFeaturesRouter from "routes/eventFeatures";
import eventsRouter from "routes/events";
import geographyRouter from "routes/geography";
import venuesRouter from "routes/venues";

import { createPool } from "mysql";

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-type, Authorization");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));

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

const jwtMN = exjwt({ secret: "rollinrollinrollin" });
app.use(jwtMN.unless({path: ["/auth/login"]}));

app.use((err: ErrorEventHandler, req: Request, res: Response, next: any) => {
    if (err.name === "UnauthorizedError") { // Send the error rather than to show it on the console
        res.status(401).send(err);
    } else {
        next(err);
    }
});

app.use("/auth", authRouter);
app.use("/eventFeatures", eventFeaturesRouter);
app.use("/events", eventsRouter);
app.use("/geography", geographyRouter);
app.use("/venues", venuesRouter);

export default app;
