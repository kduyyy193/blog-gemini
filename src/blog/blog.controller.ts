import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBlogDto: CreateBlogDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.blogService.create(createBlogDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    console.log(paginationQueryDto)
    return this.blogService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.blogService.update(+id, updateBlogDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.blogService.remove(+id, userId);
  }
}
