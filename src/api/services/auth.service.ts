 import bcrypt from "bcrypt"
import type { RUser } from "../../types";
import { sql } from "../../DB";
class AuthService{

    private async hashPassword(password:string):Promise<string>{
        const hash=await bcrypt.hash(password,10);
        return hash;
    }

    private async comparePassword(password: string, hash: string): Promise<boolean> {
       return await bcrypt.compare(password, hash);
  }


  async createUser(user:RUser & {password: string}){
       const {name,email, password,role}=user;
       const hash=await this.hashPassword(password);

       const result= await  sql`
         INSERT INTO users (name, email, password, role)
         VALUES (${name}, ${email}, ${hash}, COALESCE(${role}, 'contributor'))
       
        RETURNING id, name, email, role, created_at, updated_at
       `
       return result[0];
  }

}


export default new AuthService();