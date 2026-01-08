// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Body, Request, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto'; // <--- הוספת הייבוא
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger'; // <--- ApiBody הוספת
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
  @ApiBody({ type: LoginDto }) // <--- זה אומר ל-Swagger להציג את השדות של שם משתמש וסיסמה
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

  // נתיב מוגן לבדיקה (דורש טוקן)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // כפתור מנעול בסוואגר
  @Get('profile')
  @ApiOperation({ summary: 'קבלת פרטי המשתמש המחובר' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) // רק משתמש מחובר יכול להתנתק
  @ApiOperation({ summary: 'התנתקות מהמערכת (מחיקת ה-Cookie)' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'התנתקת בהצלחה' };
  }
}