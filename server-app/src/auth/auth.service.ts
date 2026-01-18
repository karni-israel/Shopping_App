import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable() // סימון המחלקה כשירות שניתן להזריק
export class AuthService {   // שירות לאימות והרשמה
  constructor( // הזרקות תלויות
    private usersService: UsersService, // הזרקת שירות המשתמשים
    private jwtService: JwtService, // הזרקת שירות JWT
  ) {}

  async validateUser(username: string, password: string): Promise<any> {  // אימות משתמש
    const user = await this.usersService.findByUsername(username); // חיפוש משתמש ב-DB
    if (user && user.password && await bcrypt.compare(password, user.password)) { // בדיקת סיסמה מוצפנת
      const { password, ...result } = user; // הסרת הסיסמה מהאובייקט המוחזר
      return result; // החזרת פרטי המשתמש ללא הסיסמה
    }
    return null; // החזרת null אם האימות נכשל
  }

  async googleLogin(req) { // התחברות דרך Google OAuth
    if (!req.user) { // בדיקת קיום משתמש ב-Request
      throw new BadRequestException('No user from google'); // זריקת שגיאה אם אין משתמש
    }

      const user = await this.usersService.findOrCreateOAuthUser(   // חיפוש או יצירת משתמש OAuth
      req.user.email, // אימייל המשתמש מ-Google
      'google', // סוג האימות
      req.user // פרטי המשתמש מ-Google
    );

    // החזרת JWT (ביצוע Login)
    return this.login(user); // החזרת טוקן לאחר התחברות מוצלחת
  }

  async login(user: any) { // יצירת טוקן JWT למשתמש
    const payload = { username: user.username, sub: user.id }; // יצירת ה-Payload
    return {
      access_token: this.jwtService.sign(payload), // חתימה על הטוקן
    };
  }

  // --- הפונקציה החדשה להרשמה ---
  async register(createUserDto: CreateUserDto) {
    // 1. יצירת המשתמש ב-DB
    const newUser = await this.usersService.create(createUserDto); // יצירת משתמש חדש
    
    // 2. ביצוע Login אוטומטי (החזרת טוקן)
    return this.login(newUser); // החזרת טוקן לאחר הרשמה מוצלחת
  }
}
