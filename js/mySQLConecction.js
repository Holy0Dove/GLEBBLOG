const sql = require("mysql2/promise")


  pool = sql.createPool({
    host:'localHost',
    user:'root',
    password:'1234',
    database:"blog"
})

const lastId= async ()=>{
 
  const [rows] = await pool.query(`
  SELECT user_id from USERS 
order by user_id DESC
limit 1
  `)
  return rows[0].user_id+1
} 
const addUser = async (name)=>{
  const id = await lastId() 

     pool.query(`
   INSERT INTO users (user_id,nickname)
   VALUES(?,?)
   `,[id,name])
   console.log("new user added")
   return id
}

const getIdByName = async (name)=>{

 try{ const result = await pool.query(`
SELECT user_id FROM users
where nickname = ?
`,[name])
return result[0][0].user_id 
}catch{
  return null
}

}
   
const addPassword = async (userID,password,salt)=>{
  await pool.query(`
  INSERT INTO passwords (user_id,hashedPassword,salt)
  VALUES(?,?,?)
  `,[userID,password,salt])
}

const passById = async (id)=>{
  try{
const answer= await pool.query(`
SELECT hashedPassword,salt from passwords
where user_id = ?
`,[id])
return answer[0][0]}
catch{return null}
}

const checkNickname = async (name)=>{

 const [otherName]= await pool.query(`
SELECT nickname FROM users
where nickname = ?
`,[name])
return otherName.length == 0

}




module.exports={addUser,addPassword,checkNickname,getIdByName,passById}