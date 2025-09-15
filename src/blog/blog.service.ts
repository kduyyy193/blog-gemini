import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService){}

  create(createBlogDto: CreateBlogDto, authorId: number) {
    const item = this.prismaService.blog.create({
      data: {
        ...createBlogDto,
        published: createBlogDto.published ?? true,
        authorId,
      },
      include: {
        author: true
      }
    })
    return {
      item
    };
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const page = paginationQueryDto.page || 1;
    const limit = paginationQueryDto.limit || 10;
    const sortBy = paginationQueryDto.sortBy || 'id';
    const sortOrder = paginationQueryDto.sortOrder || 'desc';
    console.log({
      sortBy,
      sortOrder
    })

    const [items, total] =  await Promise.all([
      this.prismaService.blog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prismaService.blog.count()
    ])

    return {
      items,
      page,
      limit,
      total
    }
    
  }

  async findOne(id: number) {
    const item = await this.prismaService.blog.findUnique({
      where: {
        id
      }
    });

    return {
      item,
    }
  }

  async update(id: number, updateBlogDto: UpdateBlogDto, userId: number) {
    const exist = await this.findOne(id)
    if (!exist.item) {
      throw new NotFoundException('User not found')
    }

    if (exist.item.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to update')
    }

    const item = await this.prismaService.blog.update({
      where: {
        id
      },
      data: updateBlogDto
    })

    return {
      item
    }

  }

  async remove(id: number, userId: number) {
    const exist = await this.findOne(id)
    if (!exist.item) {
      throw new NotFoundException('User not found')
    }

    if (exist.item.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to delete')
    }
    
    const item = await this.prismaService.blog.delete({
      where: {
        id
      }
    });

    return {
        ...item,
        isDeleted: true
    }
  }
}
