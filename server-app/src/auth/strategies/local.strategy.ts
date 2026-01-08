// c:\Users\Israel\Desktop\‏‏תיקיה חדשה\לימודים\לימודים ערן\Shopping_App\server-app\src\auth\strategies\local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
    // כברירת מחדל מצפה לשדות 'username' ו-'password' ב-Body
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    }
    return user;
  }
}
