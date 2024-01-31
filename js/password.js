const crypto = require("node:crypto")


const hashPassword = (password) =>{
    const salt = crypto.randomBytes(16).toString("hex")
    const saltedPassword = password + salt
    const hash = crypto.createHash("sha256").update(saltedPassword).digest("hex")
    return {hash,salt}

    
}

const checkPass = (enterPass,salt,checkPassword)=>{
    const saltedPassword = enterPass+salt
    const hashedPassword = crypto.createHash("sha256").update(saltedPassword).digest("hex")
    console.log(checkPassword)
    console.log(hashedPassword)
    return checkPassword === hashedPassword

}
