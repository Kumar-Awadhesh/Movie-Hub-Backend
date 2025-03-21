const express = require("express");
const fs = require("fs");
const cors = require("cors")
const path = require("path")
const app = express();

app.use(express.json());
app.use(cors())
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/movies", (req, res) =>{

    const page = parseInt(req.query._page) || 1; 
    const perPage = parseInt(req.query._perPage) || 12;

    fs.readFile("./db.json", "utf-8", (err, data) =>{
        if(err){
            res.status(404).send("somthing went wrong", err);
        }
        else{
            let parsdata = JSON.parse(data);
           
            const totalMovie = parsdata.movies.length;

            if(!req.query._page || !req.query._perPage){
                return res.json({
                    Movies: parsdata.movies,
                    TotalMovies: totalMovie,
                })
            }

            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedMovies = parsdata.movies.slice(startIndex, endIndex);

            res.json({
                Movies: paginatedMovies,
                TotalMovies: totalMovie,
            })
        }
    });

})

app.post("/movies", (req, res) =>{
    let data = fs.readFileSync("./db.json", "utf-8");
    let parsdata = JSON.parse(data);
    parsdata.movies.push(req.body);
    fs.writeFileSync("./db.json", JSON.stringify(parsdata, null, 2));
    res.status(200).send("Data Recieved Sucessfully!")
})

app.put("/movies/:id", (req, res) =>{
    try{
        let movieId = parseInt(req.params.id);
        let data = fs.readFileSync("./db.json", "utf-8");
        let parsdata = JSON.parse(data);

        if (!Array.isArray(parsdata.movies)) {
            return res.status(500).send({ 
                error: "Movies array not found", 
                details: "The 'movies' array is missing or invalid in db.json" 
            });
        }

        const movieIndex = parsdata.movies.findIndex(movie => movie.id === movieId);

        if(movieIndex === -1){
            res.status(404).send("error: not found!")
        }

        parsdata.movies[movieIndex] = {...parsdata.movies[movieIndex], ...req.body};

        fs.writeFileSync("./db.json", JSON.stringify(parsdata, null, 2));
        res.status(200).send("Data Updated Sucessfully!");
    } catch(err){
        res.status(500).send({error: "somthing went wrong", details: err.message});
    }
})

app.delete("/movies/:id", (req, res) => {
    try {
        let movieId = parseInt(req.params.id); // Parse the ID from the URL
        let data = fs.readFileSync("./db.json", "utf-8");
        let parsdata = JSON.parse(data);

        // Check if 'movies' exists and is an array
        if (!Array.isArray(parsdata.movies)) {
            return res.status(500).send({
                error: "Movies array not found",
                details: "The 'movies' array is missing or invalid in db.json"
            });
        }

        // Find the index of the movie by matching the ID
        const movieIndex = parsdata.movies.findIndex(movie => movie.id === movieId);

        if (movieIndex === -1) {
            return res.status(404).send("Error: Movie not found!");
        }

        // Remove the movie from the array
        const deletedMovie = parsdata.movies.splice(movieIndex, 1);

        console.log("Deleted movie:", deletedMovie);

        // Write the updated data back to the db.json file
        fs.writeFileSync("./db.json", JSON.stringify(parsdata, null, 2));
        res.status(200).send("Movie Deleted Successfully!");
    } catch (err) {
        res.status(500).send({ error: "Something went wrong", details: err.message });
    }
});

app.use((req, res) =>{
    res.status(404).send("404: not found");
})

app.listen(3300, () =>{
    console.log("server running on http://localhost:3300");
})