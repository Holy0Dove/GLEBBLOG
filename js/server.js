const fs = require("node:fs")
const express = require("express")

const path = require("path")
const cookieParser = require("cookie-parser")




//files
const{hashPassword,checkPass} = require("./password.js")
const{sendToDB,receiveFromDB} = require("./mySQLConecction.js")
const{makeRefreshToken,checkRefreshToken,checkAccessToken} = require("./jwt.js")



//variables
const pathToDir = path.join(__dirname,"../",)



//local fn
const sendRT = (id,login)=>{

    const payload={id:id,login:login}
    const {accessToken,refreshToken} = makeRefreshToken(payload)
    sendToDB.storeRefreshToken(id,refreshToken)
    return {accessToken,refreshToken}

}








const app = express()
app.set('view engine','ejs')
app.set('views', path.join(pathToDir,"/views"))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(pathToDir+"/html/"))




app.use((req,res,next)=>{ //try check cookie and send login if have// middleware
const cookie = req.cookies
let accessToken = checkAccessToken(cookie.at)

if(accessToken){
    
    req.user=accessToken
    receiveFromDB.getProfileImg(req.user.id).then(img => {req.user.imgUrl=img
        next()
    })

}else if(checkRefreshToken(cookie.rt)){
    
    receiveFromDB.checkDatabaseToken(cookie.rt).then(DbToken=>{
        if(DbToken){
            
            const accessTokenCoded = checkRefreshToken(cookie.rt)
            res.cookie("at",accessTokenCoded)
            req.user=checkAccessToken(accessTokenCoded)
            receiveFromDB.getProfileImg(req.user.id).then(img => {req.user.imgUrl=img
                next()
            })
        }
        
    })

    
}else{
    req.user=null
    next()
}




})



//get
app.get("/",(req,res)=>{
    console.log(req.user)
    res.status(200)
    res.redirect("main")
    
    
})



app.get("/main",(req,res)=>{
    
    // const mainPage = fs.readFileSync(path.join( pathToDir,"html/main.html"))
    // const logedMainPage = fs.readFileSync(path.join(pathToDir,"html/mainLoged.html"))
    
    receiveFromDB.getFourPost(1).then(posts=>{
    receiveFromDB.takeNewUsers().then(newUsers=>{
        if(req.user){
         
            
            res.status(200)
            res.render("mainLoged",{posts,page:1,profile:null,user:req.user,newUsers:newUsers})
        }else{
            
            res.status(200)
            
            res.render("main",{posts,page:1,profile:null,newUsers:newUsers})
        }
            })
    
    
   })
    
    
    
    
})

app.get("/settings",(req,res)=>{
   // const settingsPage = fs.readFileSync(path.join(pathToDir,"html/settingsLoged.html"))

    if(req.user){
        res.status(200)
        
        res.render("settings.ejs",{user:req.user})
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






app.get("/getSavePost",(req,res)=>{
    if(req.user){
       const userId = req.user.id
       receiveFromDB.getSavePost(userId).then(answer=>{
        
        res.status(200)
        res.end(answer)

       })
        
    }
    else{
    res.status(401)
    res.end()
    }
})



app.get("/postN:postId",(req,res)=>{
    
        
    receiveFromDB.getPost(req.params.postId).then(answer =>{

        if(answer){

            receiveFromDB.getINamebyId(answer.user_id).then(username=>{
                receiveFromDB.postComments(req.params.postId).then(comments=>{
            const dateObject= new Date(answer.dateOfPost)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const date = dateObject.getDate() +' '+ months[dateObject.getMonth()]
                if(req.user){
                    res.render('posts',{data:answer,username:username,date:date,user:req.user,postId:req.params.postId,comments:comments})
                }else{
                    res.render('posts',{data:answer,username:username,date:date,user:null,postId:req.params.postId,comments:comments})
                }
            
                })

        })
    }else{
        res.status(404)
        res.end("bro this is end")
    }
        
        
 
     })
})



app.get("/page:pageId",(req,res)=>{
    if(req.params.pageId < 2){
        res.status(300)
    res.redirect("/main")
    }else{
        receiveFromDB.getFourPost(req.params.pageId).then(posts=>{
            
                if(req.user){
        
                    res.status(200)
                    res.render("mainLoged",{posts,page:req.params.pageId,profile:null,user:req.user,newUsers:null})
                }else{
                    
                    res.status(200)
                    res.render("main",{posts,page:req.params.pageId,profile:null,newUsers:null})
                }
            
            

        })
        
    }



})

app.get("/userProfile:userId/page:pageId",(req,res)=>{
    
    receiveFromDB.FourPostFromUser(req.params.pageId,req.params.userId).then(posts=>{
        receiveFromDB.userData(req.params.userId).then(profile=>{
            res.status(200)
        res.render("main.ejs",{posts,page:req.params.pageId,profile:profile,newUsers:null})

        })
        
        

    })
    
    
})
app.get("/about",(req,res)=>{
    res.status(200)
    res.render("about.ejs")
})


//post
app.post("/login",(req,res)=>{
    const user = req.body
    
    receiveFromDB.getIdByName(user.login).then((id)=>{
        
        if(id){
        receiveFromDB.passById(id).then((hashSalt)=>{
            
                
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
    

    receiveFromDB.checkNickname(newUser.login).then((answer)=>{
        if(!answer){
            res.end("sorry this nick already taken")
        }else{
         const {hash,salt} = hashPassword(newUser.pas1)
         sendToDB.addUser(newUser.login).then((id)=>{
            sendToDB.addPassword(id,hash,salt)
            res.send("nice,now try login")
         })
        }})
})

app.post("/createPost",(req,res)=>{

    
    const postData = req.body
    
    const userId =req.user.id
    if(postData.postOrSave == "post"){
        sendToDB.makePost(userId,postData.post,postData.name,postData.image)
        sendToDB.savePost(userId,null)

    }else if(postData.postOrSave == "save"){
        sendToDB.savePost(userId,postData.post)
    }

    
})

app.post("/leaveComment",(req,res)=>{
    
if(req.user){
 sendToDB.storeComment(req.user.id,req.body.postId,req.body.comment,req.body.commentId)
 res.status(200)
 res.end("nice")
}else
res.status(404)
res.end(null)

})

app.delete("/deletePost",(req,res)=>{
    
   sendToDB.deletePost(req.body.postToDelete)
   res.status(200)
   res.end('true')
})

app.delete("/logout",(req,res)=>{
   
    res.status(200)
    
    res.cookie("at",null,{expires:new Date()})
    res.cookie("rt",null,{expires:new Date()})
    res.end()
})

app.patch("/changeData",(req,res)=>{
     //TODO: add all changed data and update mySql for all stuff
     
     switch(req.body.whatNeedChange){
        case"login":
        // add a check for duplicate userName again
        receiveFromDB.checkNickname(req.body.data).then(username=> {
            if(username){
                sendToDB.changeNickname(req.user.id,req.body.data)
                console.log("we changing login")
                res.status(200)
                res.end("true")
            }
            else{
                res.status(400)
                res.end(null)
            }
        })
      
         break

         case"password":
            const {hash,salt}=hashPassword(req.body.data)
            sendToDB.changePassword(req.user.id,hash,salt)
            res.status(200)
            res.end("true")
         break

         case"image":
            sendToDB.changeProfileImg(req.user.id,req.body.data)
            
            res.status(200)
            res.send("true")
            
            break

         default:
            res.status(400)
            res.end(null)
         
     }
     
    
    

})

app.get("*",(req,res)=>{
    res.status(404)
    res.end("notFound404")
})






app.listen(3000,()=>{
    console.log("server work at 3000 port")
})


 