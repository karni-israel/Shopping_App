import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('No user from google');
    }

    const user = await this.usersService.findOrCreateOAuthUser(
      req.user.email,
      'google',
      req.user
    );

    return this.login(user);
  }

  // 👇 השינוי כאן: הוספתי את user.role לתוך הטוקן
  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      role: user.role // <--- הוספנו את זה! חשוב מאוד להרשאות
    }; 
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    return this.login(newUser);
  }
}