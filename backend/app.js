import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/submit", (req, res) => {
    console.log("Received batch.");
    console.dir(req.body, { depth: null });

    res.status(200).json({status: "ok"});
});

app.listen(3000, () => console.log("App listening on port 3000"));