const http = require("http")
const WebSocket = require("ws")

const {receiveFromDB} = require("./mySQLConecction")


const server = http.createServer((req,res)=>{})
const wss = new WebSocket.Server({server})

wss.on("connection",(ws)=>{
    
    console.log("dude connected")

    ws.on("message",(message)=>{
        const suggest = JSON.parse(message)
        console.log(suggest)
        receiveFromDB.searchBar(suggest).then(answer =>{
            console.log("take this")
            ws.send(JSON.stringify(answer))
        })
    })
    ws.on('close',()=>{
        console.log("dude close")
    })
})

server.listen(4000, () => {
    console.log('Server is running on port 4000');
  });