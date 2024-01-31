const sql = require("mysql2")


  pool = sql.createPool({
    host:'localHost',
    user:'root',
    password:'1234',
    database:"blog"
})

const addUser = async (name)=>{
   
    pool.query(`
   INSERT INTO users (nickname)
   VALUES(?)
   `,[name])
   console.log("new user added")
   }


