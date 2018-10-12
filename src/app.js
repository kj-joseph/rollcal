const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const geographyRouter = require("./routes/geography");
const eventsRouter = require("./routes/events");
const venuesRouter = require("./routes/venues");
const eventFeaturesRouter = require("./routes/eventFeatures");

const mysql = require("mysql");

let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));

app.use((req, res, next) => {
	res.locals.connection = mysql.createPool({
		host: process.env.ROLLCAL_DB_HOST,
		user: process.env.ROLLCAL_DB_USER, 
		password: process.env.ROLLCAL_DB_PASSWORD,
		database: process.env.ROLLCAL_DB_DATABASE,
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
