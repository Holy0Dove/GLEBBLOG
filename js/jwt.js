const path = require("path")
require('dotenv').config({path:path.join(__dirname,"../.env")});

const jwt = require("jsonwebtoken");
const key = process.env.SECRET_KEY



const makeAccessToken = (payload)=>{

const token = jwt.sign(payload,key,{algorithm:"HS256",expiresIn:"15m"})

return token

}


const makeRefreshToken = (payload)=>{
    
const accessToken = makeAccessToken(payload)
const refreshToken = jwt.sign(payload,key,{algorithm:"HS256",expiresIn:"2h"})

return {accessToken,refreshToken}
}



const checkRefreshToken = (refreshToken)=>{
return jwt.verify(refreshToken,key,(err,decoded)=>{
if(err){
return false
}
else{
    
    const {id,login} = decoded
   
const accessToken = makeAccessToken({login:login,id:id})
return accessToken
}

})}



const checkAccessToken = (accessToken)=>{
  return jwt.verify(accessToken,key,(err,decoded)=>{
        if(err){
            return false 
        }else
        return decoded
    })
}




module.exports={makeRefreshToken,checkRefreshToken,checkAccessToken}
 

 
