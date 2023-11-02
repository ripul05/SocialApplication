const {Pool} = require("pg")

const pool = new Pool({
    user : "postgres",
    host : "localhost",
    database : "node-training",
    password : "Officeyama@2023",
    port : 5432
})

module.exports = pool