const express = require("express")
const surveyRoute = require("./routes/surveyRoute")




const app = express()

app.use(express.json())

app.get("/", (req, res)=> {
    res.json({msg: "hello world"})
})

app.use("/survey", surveyRoute)




app.use("*", (req, res) => {
    res.status(404).json({msg: "Route not found"})
})

app.use((err, req, res, next) => {
    res.json({msg: "Internal Error",  err})
})

app.listen(3000)

