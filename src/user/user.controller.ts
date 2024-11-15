import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, UseGuards, Req, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleTypes } from 'src/common/enums/user.enum';
import { RequestWithUser } from 'src/common/types/user.types';

@Controller('user')
@UseGuards(AuthGuard)
@Roles(RoleTypes.User)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }




  @Get()
  findAll(
    @Req() Request: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return this.userService.findAll(page, limit, Request.userId)
    } catch (error) {
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
