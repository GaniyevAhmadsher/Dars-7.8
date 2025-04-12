import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private usersService: UsersService) {}

  @Get('users')
  findAllUsers() {
    return this.usersService.findAll();
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
