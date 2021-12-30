const fs = require("fs");
const express = require("express");

const app = express();
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));
app.get("/api/v1/tours", (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours: tours,
        },
    });
});

const findTour = (id) => {
    const found_tour = tours.find((t) => t.id === Number(id));
    const data = found_tour ? found_tour : { status: "error", message: "Tour not found" };
    const status_code = found_tour ? 200 : 404;
    return { data, status_code };
};

app.get("/api/v1/tours/:id", (req, res) => {
    const { id } = req.params;
    const { data, status_code } = findTour(id);
    res.status(status_code).json(data);
});

app.post("/api/v1/tours", (req, res) => {
    const new_id = tours.length;
    const new_tour = { id: new_id, ...req.body };
    tours.push(new_tour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.status(201).json({
            status: "success",
            data: {
                tour: new_tour,
            },
        });
    });
});

app.patch("/api/v1/tours/:id", (req, res) => {
    const { id } = req.params;
    const { data, status_code } = findTour(id);
    if (status_code === 404) {
        res.status(status_code).json(data);
    } else {
        const updated_tour = { ...req.body, id: data.id };
        const new_tours = tours.map((tour) => {
            if (tour.id === data.id) {
                return updated_tour;
            }
            return tour;
        });
        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(new_tours), (err) => {
            res.status(201).json({
                status: "success",
                data: {
                    tour: updated_tour,
                },
            });
        });
    }
});

app.delete("/api/v1/tours/:id", (req, res) => {
    const { id } = req.params;
    const { data, status_code } = findTour(id);
    if (status_code === 404) {
        res.status(status_code).json(data);
    } else {
        const new_tours = tours.filter((tour) => tour.id !== data.id);
        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(new_tours), (err) => {
            res.status(201).json({
                status: "success",
                data: {
                    tour: data,
                },
            });
        });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});