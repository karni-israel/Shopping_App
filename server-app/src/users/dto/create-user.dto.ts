import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'סיסמה באורך 6 תווים לפחות' })
  @IsString()
  @MinLength(6) // ולידציה לסיסמה
  password: string; // זה השדה שהיה חסר לך!
}