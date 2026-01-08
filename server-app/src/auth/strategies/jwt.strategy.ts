import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // שינוי: קריאת הטוקן מה-Cookie במקום מה-Header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false, // לא מאשר טוקן שפג תוקפו
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_key', // מונע שגיאת טיפוסים במקרה שהמשתנה לא נמצא
    });
  }


  async validate(payload: any) {
    // מחזיר את המידע שיש בתוך הטוקן לתוך האובייקט req.user
    return { userId: payload.sub, username: payload.username };
  }
}