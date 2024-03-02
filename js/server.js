const fs = require("node:fs")
const express = require("express")
const https = require("https")
const path = require("path")
const cookieParser = require("cookie-parser")




//files
const{hashPassword,checkPass} = require("./password.js")
const{addUser,addPassword,checkNickname,getIdByName,passById,storeRefreshToken,checkDatabaseToken} = require("./mySQLConecction.js")
const{makeRefreshToken,checkRefreshToken,checkAccessToken} = require("./jwt.js")



//variables
const pathToDir = path.join(__dirname,"../",)



//local fn
const sendRT = (id,login)=>{

    const payload={id:id,login:login}
    const {accessToken,refreshToken} = makeRefreshToken(payload)
    storeRefreshToken(id,refreshToken)
    return {accessToken,refreshToken}

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




app.use((req,res,next)=>{ //try check cookie and send login if have// middleware
const cookie = req.cookies
let accessToken = checkAccessToken(cookie.at)

if(accessToken){
    
    req.user=accessToken
next()
}else if(checkRefreshToken(cookie.rt)){
    
    checkDatabaseToken(cookie.rt).then(DbToken=>{
        if(DbToken){
            
            const accessTokenCoded = checkRefreshToken(cookie.rt)
            res.cookie("at",accessTokenCoded)
            req.user=checkAccessToken(accessTokenCoded)
            
        }
        next()
    })

    
}else{
    req.user=null
    next()
}




})



//get
app.get("/",(req,res)=>{
    
    res.status(200)
    res.redirect("main")
    
    
})



app.get("/main",(req,res)=>{
    
    const mainPage = fs.readFileSync(path.join( pathToDir,"html/main.html"))
    const logedMainPage = fs.readFileSync(path.join(pathToDir,"html/mainLoged.html"))
   
    
    
    if(req.user){
        
        res.status(200)
        res.end(logedMainPage)
    }else{
        res.status(200)
        res.end(mainPage)
    }
    
})

app.get("/settings",(req,res)=>{
    const settingsPage = fs.readFileSync(path.join(pathToDir,"html/settingsLoged.html"))

    if(req.user){
        res.status(200)
        res.end(settingsPage)
    }else{
    res.status(300)
    res.redirect("/main")
    }
})


app.get("/createPost",(req,res)=>{
    const createPostPage = fs.readFileSync(path.join(pathToDir,"html/createLoged.html"))

    if(req.user){
        res.status(200)
        res.end(createPostPage)
    }else{
    res.status(300)
    res.redirect("/main")
    }

})


app.get("/getUser",(req,res)=>{
if(req.user){
    res.status(200)
    res.end(JSON.stringify(req.user))
}
else
res.status(401)
res.end()

    
})


//post
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
                res.status(200)
                res.send(true)
               
           }else 
           res.send(null)

        })
    }else res.send(null)

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
app.delete("/logout",(req,res)=>{
   
    res.status(200)
    
    res.cookie("at",null,{expires:new Date()})
    res.cookie("rt",null,{expires:new Date()})
    res.end()
})

app.patch("/changeData",(req,res)=>{
     //TODO: add all changed data and update mySql for all stuff
     console.log('its here')
    res.status(200)
    res.end(null)
    

})

app.get("*",(req,res)=>{
    res.status(404)
    res.end("notFound404")
})


const server = https.createServer(options,app)



server.listen(3000,()=>{
    console.log("server work at 3000 port")
})


 