 import bcrypt from "bcrypt"
import type { RUser } from "../../types/index.js";
import { sql } from "../../DB/index.js";
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

  async loginUser(email: string, password: string) {
    const result = await sql`
      SELECT id, name, email, password, role, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    const user = result[0] as any;
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

}


export default new AuthService();