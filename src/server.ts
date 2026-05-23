
import app from "./app.js";
import { config } from "./config/config.js";
import { initDB } from "./DB/index.js";

const main=async()=>{
     await initDB();

     app.listen(config.port,()=>{
         console.log(`server running on port ${config.port}`)
     })
}

main();