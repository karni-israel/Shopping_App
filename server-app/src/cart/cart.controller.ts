import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Cart')
@UseGuards(JwtAuthGuard) // כל הפעולות בעגלה דורשות התחברות
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'קבלת העגלה של המשתמש הנוכחי' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'הוספת מוצר לעגלה' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'מחיקת פריט מהעגלה' })
  removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(req.user.userId, +itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'ריקון העגלה' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}