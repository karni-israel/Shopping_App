import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'; // ייבוא מודולים ושירותים נחוצים
import { InjectRepository } from '@nestjs/typeorm';  // ייבוא של TypeORM Repository
import { Repository, DataSource } from 'typeorm'; // ייבוא של ישויות TypeORM
import { Order } from './entities/order.entity'; // ייבוא ישות ההזמנה
import { OrderItem } from '../order-item/entities/order-item.entity'; // ייבוא ישות פריט ההזמנה
import { Product } from '../product/entities/product.entity'; // ייבוא ישות המוצר
import { CartService } from '../cart/cart.service'; // ייבוא שירות העגלה
import { User } from '../users/entities/user.entity'; // ייבוא ישות המשתמש

@Injectable() // סימון המחלקה כשירות שניתן להזריק
export class OrderService { // הגדרת מחלקת שירות ההזמנות
  constructor( // הזרקת תלויות דרך הקונסטרקטור  
    @InjectRepository(Order) // הזרקת רפוזיטורי של הזמנות
    private orderRepository: Repository<Order>, // רפוזיטורי להזמנות
    @InjectRepository(OrderItem) // הזרקת רפוזיטורי של פריטי הזמנות
    private orderItemRepository: Repository<OrderItem>, // רפוזיטורי לפריטי הזמנות
    @InjectRepository(Product) // הזרקת רפוזיטורי של מוצרים
    private productRepository: Repository<Product>, // רפוזיטורי למוצרים
    private cartService: CartService, // הזרקת שירות העגלה
    private dataSource: DataSource, // הזרקת מקור הנתונים של TypeORM
  ) {} // סיום הקונסטרקטור

  async create(userId: number) { // יצירת הזמנה חדשה עבור משתמש מסוים 
    const cart = await this.cartService.getCart(userId); // שליפת העגלה של המשתמש

    if (!cart || cart.items.length === 0) { // בדיקת קיום העגלה 
      throw new BadRequestException('Cart is empty');  // זריקת שגיאה אם העגלה ריקה 
    } // התחלת טרנזקציה

    // שימוש בטרנזקציה כדי למנוע Race Conditions (מכירת יתר)
    const orderId = await this.dataSource.transaction(async (manager) => { // התחלת הטרנזקציה
      // 1. שליפת המוצרים עם נעילה (Lock) // שליפת כל המוצרים בעגלה עם נעילה כדי למנוע שינויים במלאי
      const productIds = cart.items.map((item) => item.product.id); // קבלת מזהי המוצרים שבעגלה
      const products = await manager  // חיפוש המוצרים
        .createQueryBuilder(Product, 'product') // יצירת שאילתה על ישות המוצר
        .where('product.id IN (:...ids)', { ids: productIds }) // סינון לפי מזהי המוצרים
        .setLock('pessimistic_write') // נעילה קריטית!
        .getMany(); // ביצוע השאילתה וקבלת המוצרים

      // 2. בדיקת מלאי וחישוב סכום
      let totalAmount = 0; // משתנה לאחסון הסכום הכולל של ההזמנה
      
      for (const item of cart.items) { // מעבר על כל פריטי העגלה
        const product = products.find((p) => p.id === item.product.id);// מציאת המוצר המתאים
        
        if (!product) {
           throw new NotFoundException(`Product ${item.product.name} not found`);// בדיקת קיום המוצר
        }
        
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for product ${product.name}`);// בדיקת מלאי
        }

        totalAmount += Number(product.price) * item.quantity;// חישוב סכום כולל
      }

      // 3. יצירת ההזמנה
      const order = manager.create(Order, {// יצירת ישות הזמנה חדשה
        user: { id: userId } as User,// שיוך המשתמש
        totalAmount,
      });
      const savedOrder = await manager.save(order); // שמירת ההזמנה במסד הנתונים

      // 4. יצירת הפריטים ועדכון המלאי
      for (const item of cart.items) {
        const product = products.find((p) => p.id === item.product.id); // מציאת המוצר המתאים
        
        if (!product) { // בדיקת קיום המוצר
          throw new NotFoundException(`Product ${item.product.name} not found`); // בדיקת קיום המוצר
        }

        const orderItem = manager.create(OrderItem, { // יצירת הפריט להזמנה
          order: savedOrder, // שיוך להזמנה
          product: product, // שיוך למוצר
          quantity: item.quantity, // כמות
          price: product.price, // מחיר יחידה
        });
        await manager.save(orderItem); // שמירת פריט ההזמנה במסד הנתונים

        // עדכון המלאי

        product.stock -= item.quantity; // הפחתת המלאי
        await manager.save(product); // שמירת העדכון במסד הנתונים
      }

      // 5. ריקון העגלה
      await this.cartService.clearCart(userId); // ריקון העגלה לאחר יצירת ההזמנה

      return savedOrder.id; // החזרת מזהה ההזמנה שנוצרה
    }); // סיום הטרנזקציה

    return this.findOne(orderId); // החזרת פרטי ההזמנה שנוצרה
  }

  async findAll(userId: number) { // שליפת כל ההזמנות של משתמש מסוים
    return this.orderRepository.find({ // חיפוש ההזמנות במסד הנתונים
      where: { user: { id: userId } }, // סינון לפי מזהה המשתמש
      relations: ['items', 'items.product'],// טעינת הקשרים של פריטי ההזמנה והמוצרים
      order: { orderDate: 'DESC' } // מיון לפי תאריך הזמנה בסדר יורד
    });// החזרת רשימת ההזמנות
  } // סיום הפונקציה

  async findOne(id: number) { // שליפת הזמנה לפי מזהה
    return this.orderRepository.findOne({ // חיפוש ההזמנה במסד הנתונים
      where: { id }, // סינון לפי מזהה ההזמנה
      relations: ['items', 'items.product', 'user'], // טעינת הקשרים של פריטי ההזמנה והמוצרים
    
    });   // החזרת פרטי ההזמנה
    } // סיום הפונקציה

  async remove(id: number, userId: number) { // מחיקת הזמנה לפי מזהה
    const order = await this.orderRepository.findOne({ where: { id, user: { id: userId } } }); // חיפוש ההזמנה במסד הנתונים
    if (!order) { // בדיקת קיום ההזמנה
      throw new NotFoundException('Order not found'); // זריקת שגיאה אם ההזמנה לא נמצאה
    } // מחיקת ההזמנה
    return this.orderRepository.remove(order); // מחיקת ההזמנה
  } // סיום הפונקציה
} // סיום המחלקה