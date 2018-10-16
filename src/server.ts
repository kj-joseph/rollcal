import app from "app";

const debug = require("debug")("rollcalapi:server");
const http = require("http");

const port = normalizePort(process.env.PORT || process.env.ROLLCAL_API_PORT || "55002");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: string) {
	const portNum = parseInt(val, 10);

	if (isNaN(portNum)) {
	// named pipe
	return val;
	}

	if (portNum >= 0) {
		return portNum;
	}

	return false;
}

function onError(error: NodeJS.ErrnoException ) {
	if (error.syscall !== "listen") {
	throw error;
	}

	const bind = typeof port === "string"
	? "Pipe " + port
	: "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
	case "EACCES":
		console.error(bind + " requires elevated privileges");
		process.exit(1);
		break;
	case "EADDRINUSE":
		console.error(bind + " is already in use");
		process.exit(1);
		break;
	default:
		throw error;
	}
}

function onListening() {
	const addr = server.address();
	const bind = typeof addr === "string"
	? "pipe " + addr
	: "port " + addr.port;
	debug("Listening on " + bind);
}
