import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  // 👇 השינוי כאן: הוספתי דוקומנטציה כדי שיהיה ברור
  @ApiProperty({ 
    example: 'ADMIN', 
    description: 'תפקיד המשתמש: ADMIN או USER', 
    required: false,
    enum: UserRole 
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be either ADMIN or USER' })
  role?: UserRole;

  @ApiProperty({ example: '123456', description: 'סיסמה באורך 6 תווים לפחות' })
  @IsString()
  @MinLength(6)
  password: string; 
}