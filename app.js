const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const geographyRouter = require("./routes/geography");
const eventsRouter = require("./routes/events");
const venuesRouter = require("./routes/venues");
const eventFeaturesRouter = require("./routes/eventFeatures");

const dbAuth = require ("./dbAuth");

const mysql = require("mysql");

let app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
	res.locals.connection = mysql.createPool({
		host: dbAuth.host,
		user: dbAuth.user,
		password: dbAuth.password,
		database: dbAuth.database,
		timezone: "utc",
		connectionLimit: 50
	});
//	res.locals.connection.connect();
	next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/geography", geographyRouter);
app.use("/venues", venuesRouter);
app.use("/eventFeatures", eventFeaturesRouter);

module.exports = app;
