import { Controller, Get, Post, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'ביצוע הזמנה (Checkout) מהעגלה הנוכחית' })
  create(@Request() req) {
    return this.orderService.create(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'קבלת היסטוריית הזמנות' })
  findAll(@Request() req) {
    return this.orderService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת פרטי הזמנה ספציפית' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת הזמנה מההיסטוריה' })
  remove(@Param('id') id: string, @Request() req) {
    return this.orderService.remove(+id, req.user.userId);
  }
}