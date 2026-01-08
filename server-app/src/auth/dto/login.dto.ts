// src/auth/dto/login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user1', description: 'שם המשתמש' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123456', description: 'הסיסמה' })
  @IsString()
  password: string;
}
