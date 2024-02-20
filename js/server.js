const fs = require("node:fs")
const express = require("express")
const https = require("https")
const path = require("path")
const cookieParser = require("cookie-parser")




//files
const{hashPassword,checkPass} = require("./password.js")
const{addUser,addPassword,checkNickname,getIdByName,passById} = require("./mySQLConecction.js")
const{makeRefreshToken,checkRefreshToken,checkAccessToken} = require("./jwt.js")



//variables
const pathToDir = path.join(__dirname,"../",)



//local fn
const sendRT = (id,login)=>{
const payload={id:id,login:login}
return {accessToken,refreshToken}=makeRefreshToken(payload)

//add for db code part //
}



//https options for certificates
const options = {
    key: fs.readFileSync(pathToDir+"/cert/localhost.key"),
    cert: fs.readFileSync(pathToDir+"/cert/localhost.crt")
}



const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.static(pathToDir+"/html/"))




app.use((req,res,next)=>{ //try check cookie and send login if have middleware
const cookie = req.cookies
console.log(checkAccessToken(cookie.at) ? true: "now it uses rt"/*checkRefreshToken(cookie.rt)*/)

next()
})



app.get("/",(req,res)=>{
    
    res.status(200)
    res.redirect("main")
    
    
})



app.get("/main",(req,res)=>{
    
    const html = fs.readFileSync(path.join( pathToDir,"html/main.html"))
    
   
    
   
    res.status(200)
    res.end(html)
    
})

app.post("/login",(req,res)=>{
    const user = req.body
    
    getIdByName(user.login).then((id)=>{
         
        if(id){
        passById(id).then((hashSalt)=>{
           const{hashedPassword,salt}= hashSalt
           if(checkPass(user.pas,salt,hashedPassword))
           {
               
               const{accessToken,refreshToken}= sendRT(id,user.login)
                res.cookie("at",accessToken)
                res.cookie("rt",refreshToken)
                res.sendStatus(200)
                res.end()
               
           }else 
           res.send("bro something goes wrong")
            
        })
    }else res.send("bro something goes wrong")

    })

})

app.post("/register",(req,res)=>{
    const newUser = req.body
    

    checkNickname(newUser.login).then((answer)=>{
        if(!answer){
            res.end("sorry this nick already taken")
        }else{
         const {hash,salt} = hashPassword(newUser.pas1)
         addUser(newUser.login).then((id)=>{
            addPassword(id,hash,salt)
            res.send("nice,now try login")
         })
        }})
})




const server = https.createServer(options,app)



server.listen(3000,()=>{
    console.log("server work at 3000 port")
})


 