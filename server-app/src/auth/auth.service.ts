// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // הזרקת שירות המשתמשים
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username); // חיפוש משתמש ב-DB
    if (user && await bcrypt.compare(password, user.password)) { // בדיקת סיסמה מוצפנת
      const { password, ...result } = user; // הסרת הסיסמה מהאובייקט המוחזר
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id }; // יצירת ה-Payload
    return {
      access_token: this.jwtService.sign(payload), // חתימה על הטוקן
    };
  }
  // --- הפונקציה החדשה להרשמה ---
  async register(createUserDto: CreateUserDto) {
    // 1. יצירת המשתמש ב-DB
    const newUser = await this.usersService.create(createUserDto);
    
    // 2. ביצוע Login אוטומטי (החזרת טוקן)
    return this.login(newUser);
  }
}