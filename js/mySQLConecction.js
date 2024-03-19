const sql = require("mysql2/promise")


  pool = sql.createPool({
    host:'localHost',
    user:'root',
    password:'1234',
    database:"blog"
})

const lastId= async ()=>{
 
  try {const [rows] = await pool.query(`
  SELECT user_id from USERS 
order by user_id DESC
limit 1
  `)
  return rows[0].user_id+1}
catch{return 1}
} 
const addUser = async (name)=>{
  const id = await lastId() 

     pool.query(`
   INSERT INTO users (user_id,nickname)
   VALUES(?,?)
   `,[id,name])

   pool.query(`
   INSERT INTO resreshtokens (user_id)
   VALUES(?)
   `,[id])
   pool.query(`
    INSERT INTO save_post(user_id)
    VALUES(?)
   `[id])
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
   
const getINamebyId = async (id)=>{

  try{ const result = await pool.query(`
 SELECT nickname FROM users
 where user_id = ?
 `,[id])
 return result[0][0].nickname 
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

const storeRefreshToken = async (id,rt)=>{
await pool.query(`
UPDATE resreshtokens 
SET RT = ?
WHERE user_id = ?
`,[rt,id])

}

const checkDatabaseToken = async (rt)=>{
  const token = await pool.query(`
  SELECT RT FROM resreshTokens
  where RT = ?
  `,[rt])

return token[0][0]

}
const getPostId = async()=>{
  try {const [rows] = await pool.query(`
  SELECT post_id FROM posts 
order by post_id DESC
limit 1
  `)
  
  return rows[0].post_id+1}
catch{return 1}
}

const makePost = async (userId,post,postName,imageUrl)=>{
postId = await getPostId()

  await pool.query(`
  INSERT INTO posts (user_id,post_id,textContent,dateOfPost,post_name,image_url)
  VALUES(?,?,?,NOW(),?,?)
  `,[userId,postId,post,postName,imageUrl])

}
const getPost = async (postId)=>{
  try{
  post = await pool.query(`
  SELECT * FROM posts
  where post_id = ?
  `,[postId])

  return post[0][0]
  }catch{return null}
}

const getFourPost = async (pageNum)=>{
// const max = pageNum * 4 + 1
// const min = max - 5
const offset = (pageNum-1)*4 
posts = await pool.query(`
select post_id,post_name,image_url FROM posts 
ORDER BY post_id DESC 
LIMIT 4 OFFSET ? 

`,[offset])
return posts[0]
}

const savePost = async (userId,post)=>{
  await pool.query(`
  UPDATE save_post 
  SET textContent = ?
  WHERE user_id = ?
  
  `,[post,userId])
}
const getSavePost = async (userId)=>{
  const post = await pool.query(`
  SELECT textContent FROM save_post 
  WHERE user_id =?
  `,[userId])
return post[0][0].textContent
}



module.exports={addUser,addPassword,checkNickname,getIdByName,passById,storeRefreshToken,checkDatabaseToken,makePost,savePost,getSavePost,getPost,getINamebyId,getFourPost}