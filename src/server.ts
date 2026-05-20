
import app from "./app";
import { config } from "./config/config";
import { initDB } from "./DB";

const main=async()=>{
     await initDB();

     app.listen(config.port,()=>{
         console.log(`server running on port ${config.port}`)
     })
}

main();