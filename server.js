import "dotenv/config"
import express, { urlencoded } from "express"
import cors from "cors"
import morgan from "morgan"

import {connectDB} from "./config/db.js"
import { notFound,errorHandler } from "./middleware/error.middleware.js"

import authRoutes from "./routes/auth.routes.js"
import leadRoutes from "./routes/lead.routes.js"
import ContactRoutes from "./routes/contact.routes.js"
import noteRoutes from "./routes/note.routes.js"
import taskRouters from "./routes/task.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import analyticsRoute from "./routes/analytics.routes.js"

const app = express();



app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials : true,
    }) 
);
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true}));
if (process.env.NODE_ENV !== "production" ) app.use(morgan('dev'))

    app.get("/api/health", (req,res)=>{
        res.json({success:true,status:'ok',service:"summmerCRM"})
    })



app.use("/api/auth",authRoutes)
app.use("/api/leads",leadRoutes)
app.use("/api/contacts",ContactRoutes)
app.use("/api/notes",noteRoutes)
app.use("/api/tasks",taskRouters)
app.use("/api/ai",aiRoutes)
app.use("/api/analytics",analyticsRoute)

 app.use(notFound)   
 app.use(errorHandler)

 const PORT = process.env.PORT || 8000
 const start = async () => {

     try{
         await connectDB();
         app.listen(PORT,()=>{
            console.log(` ☀️ summmerCRM API running on http://localhost:${PORT}`)
         })
        }catch(err) {
            console.error(" 🌥️ Failed to start server:",err.message);
            process.exit(1);
        }
        
    }
    start();
    export default app; 
