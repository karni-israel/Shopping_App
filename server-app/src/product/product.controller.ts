import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // 👇 1. יצירת מוצר - רק לאדמין!
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // חובה להיות מחובר + אדמין
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'יצירת מוצר חדש (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    let imageUrl = createProductDto.imageUrl || '';

    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    const productData = {
      ...createProductDto,
      imageUrl: imageUrl,
    };

    return this.productService.create(productData);
  }

  // 👇 2. קבלת כל המוצרים - פתוח לכולם (בלי שומרים)
  @Get()
  @ApiOperation({ summary: 'קבלת כל המוצרים (פתוח לכולם)' })
  findAll() {
    return this.productService.findAll();
  }

  // 👇 3. קבלת מוצר בודד - פתוח לכולם
  @Get(':id')
  @ApiOperation({ summary: 'קבלת מוצר לפי מזהה' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  // 👇 4. עדכון מוצר - רק לאדמין!
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'עדכון מוצר (Admin only)' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  // 👇 5. מחיקת הכל - רק לאדמין!
  @Delete('all/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'מחיקת כל המוצרים (Admin only)' })
  clearAll() {
    return this.productService.clearAll();
  }

  // 👇 6. מחיקת מוצר בודד - רק לאדמין!
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'מחיקת מוצר בודד (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}