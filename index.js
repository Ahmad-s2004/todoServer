const express = require('express')
const app = express()
const router = require('./router.js')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
try {
    mongoose.connect(process.env.DATABASE_URL)
    console.log('DB connected')
} catch (error) {
    console.log('DB not connected')
}
const corsOptions = {
    origin: 'https://todo-client-one-dun.vercel.app', 
    methods: ['GET,POST','DELETE','PUT'], 
    credentials: true,  
  };

app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())
app.use('/app', router)


const PORT = process.env.PORT || 6060;
app.listen(PORT,()=>{
    console.log(`Server is started at port ${PORT}`)
})