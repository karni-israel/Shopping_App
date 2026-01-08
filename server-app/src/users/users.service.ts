// 


import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. פונקציות עזר לאימות (Auth) ---

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // --- 2. יצירת משתמש (Create) ---
  
 async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, username } = createUserDto;

    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('שם המשתמש כבר תפוס');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    
    // --- התיקון כאן ---
    // אנחנו מפרקים את savedUser: לוקחים את הסיסמה לצד אחד, ואת כל השאר ל-result
    // אבל! בגלל שסוג ההחזרה הוא Promise<User>, השיטה הראשונה (any) קלה יותר למתחילים.
    // אם אתה רוצה להשתמש בזה, תצטרך לשנות את ה-delete כמו בפתרון 1, או להחזיר טיפוס כללי.
    
    delete (savedUser as any).password; // הכי פשוט כרגע
    return savedUser;
  }

  // --- 3. קריאת נתונים (Read) ---

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`משתמש עם מזהה ${id} לא נמצא`);
    }
    return user;
  }

  // --- 4. עדכון (Update) ---

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // בדיקה שהמשתמש קיים לפני העדכון
    await this.findOne(id);

    // אם מעדכנים סיסמה - צריך להצפין אותה מחדש
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // ביצוע העדכון
    await this.usersRepository.update(id, updateUserDto);
    
    // החזרת המשתמש המעודכן
    return this.findOne(id);
  }

  // --- 5. מחיקה (Delete) ---

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`משתמש עם מזהה ${id} לא נמצא`);
    }
  }
}