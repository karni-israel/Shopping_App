import { Controller, Post, UseGuards, Body, Request, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport'; // <--- ייבוא נדרש עבור גוגל

import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // נתיב פתוח לכולם - הרשמה
  @Post('register')
  @ApiOperation({ summary: 'הרשמה למערכת (פתוח לכולם)' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // נתיב התחברות (דורש שם וסיסמה)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'התחברות וקבלת טוקן' })
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { access_token } = await this.authService.login(req.user);
    
    // שמירת הטוקן ב-Cookie מאובטח
    response.cookie('access_token', access_token, {
      httpOnly: true, // לא נגיש ל-JavaScript (מונע XSS)
      secure: false, // בייצור (Production) צריך לשנות ל-true (דורש HTTPS)
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 שעות
    });

    return { message: 'התחברת בהצלחה' };
  }

  // --- התחברות עם גוגל ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'התחלת תהליך התחברות עם גוגל' })
  async googleAuth(@Request() req) {
    // הפונקציה הזו מפעילה את ה-Guard של גוגל ומעבירה את המשתמש לדף ההתחברות של גוגל
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'חזרה מגוגל, יצירת טוקן והפניה לאתר' })
  async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) response: Response) {
    // קבלת הטוקן מה-Service (שכבר יצר/מצא את המשתמש)
    const { access_token } = await this.authService.googleLogin(req);

    // שמירת הטוקן ב-Cookie (בדיוק כמו ב-login רגיל)
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 שעות
    });

    // הפניה חזרה לצד הלקוח (Frontend)
    response.redirect('http://localhost:5173');
  }

  // -----------------------

  // נתיב מוגן לבדיקה (דורש טוקן)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'קבלת פרטי המשתמש המחובר' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'התנתקות מהמערכת (מחיקת ה-Cookie)' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'התנתקת בהצלחה' };
  }
}
