import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // בתוך jwt.strategy.ts

constructor(private configService: ConfigService) {
  super({
    jwtFromRequest: ExtractJwt.fromExtractors([
      (request: Request) => {
        // 👇 התיקון כאן: הגדרנו בפירוש שזה יכול להיות string או null
        let token: string | null = null;
        
        if (request && request.cookies) {
          token = request.cookies['access_token'];
        }
        
        // אם לא מצאנו בקוקיז, ננסה מה-Header (גיבוי)
        if (!token) {
           token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        }
        
        return token;
      },
    ]),
    ignoreExpiration: false,
    secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_key',
  });
}

  async validate(payload: any) {
    // 👇 התיקון הקריטי: הוספנו את ה-role לרשימה שחוזרת
    return { 
      userId: payload.sub, 
      username: payload.username,
      role: payload.role // <--- שורה זו הייתה חסרה!
    };
  }
}