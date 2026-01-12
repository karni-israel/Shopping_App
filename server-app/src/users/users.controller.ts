// 


import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@ApiTags('Users Management') // כותרת יפה בסוואגר
@Controller('users')
@UseGuards(JwtAuthGuard) // מגן על כל הפעולות בקונטרולר הזה! רק מי שמחובר יכול לגשת
@ApiBearerAuth() // מוסיף את המנעול בסוואגר
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'יצירת משתמש חדש (Admin)' })
  @ApiResponse({ status: 201, type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת רשימת כל המשתמשים' })
  @ApiResponse({ status: 200, type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת משתמש ספצי לפי ID' })
  @ApiResponse({ status: 200, type: User })
  // ParseIntPipe - הופך אוטומטית את הטקסט למספר ומונע את השגיאה שהייתה לך!
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון פרטי משתמש' })
  @ApiResponse({ status: 200, type: User })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת משתמש' })
  @ApiResponse({ status: 200, type: User })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}