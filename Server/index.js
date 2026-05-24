require("dotenv").config();

const { connectDB } = require("./config/db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//-------------------glboal error handling--------------------------
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "Internal server error" });
});


app.get("/", (req, res) => {
    res.json({ message: "Tickting api running" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server is up and running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to the database: ", err.message);
    process.exit(1);
});

