import { Injectable, BadRequestException } from '@nestjs/common';
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

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('No user from google');
    }

    const { email, firstName, lastName } = req.user;

    // בדיקה אם המשתמש קיים במערכת.
    // אנו משתמשים באימייל כשם המשתמש לצורך הזיהוי (או findByEmail אם קיים ב-UsersService)
    let user = await this.usersService.findByUsername(email);

    if (!user) {
      // אם המשתמש לא קיים - ניצור אותו
      const randomPassword = Math.random().toString(36).slice(-8); // יצירת סיסמה רנדומלית
      
      const newUserDto: CreateUserDto = {
        username: email, // שימוש באימייל כשם משתמש
        email: email,
        password: randomPassword,
        // ניתן להוסיף שדות נוספים אם ה-DTO תומך בהם (כמו firstName, lastName)
      };

      user = await this.usersService.create(newUserDto);
    }

    // החזרת JWT (ביצוע Login)
    return this.login(user);
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
