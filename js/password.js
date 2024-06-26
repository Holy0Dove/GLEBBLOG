const crypto = require("crypto")
const jwt = require("jsonwebtoken")


const hashPassword = (password) =>{
    const salt = crypto.randomBytes(16).toString("hex")
    const saltedPassword = password + salt
    const hash = crypto.createHash("sha256").update(saltedPassword).digest("hex")
    return {hash,salt}

    
}

const checkPass = (enterPass,salt,checkPassword)=>{
    const saltedPassword = enterPass+salt
    const hashedPassword = crypto.createHash("sha256").update(saltedPassword).digest("hex")
    
    return checkPassword === hashedPassword

}

module.exports={hashPassword,checkPass}
