const fs = require("node:fs")
const express = require("express")
const https = require("https")
const path = require("path")

pathToDir = path.join(__dirname,"../",)

const options = {
    key: fs.readFileSync(pathToDir+"/cert/localhost.key"),
    cert: fs.readFileSync(pathToDir+"/cert/localhost.crt")
}
const app = express()
app.use(express.static(pathToDir+"/html/"))
app.get("/",(req,res)=>{
    
    res.status(200)
    res.sendFile(pathToDir+"/html/main.html")
})
const server = https.createServer(options,app)



server.listen(3000,()=>{
    console.log("server work at 3000 port")
})


 