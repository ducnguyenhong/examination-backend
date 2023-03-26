import {
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
import { UserService } from './user/user.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('auth/register')
  async register(@Request() req, @Headers() headers) {
    return this.userService.create(req.body, headers.authorization);
  }

  @Post('auth/check-exists')
  async checkExistsUsername(@Request() req) {
    return this.userService.checkExistsUsername(req.body?.username);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Headers() headers) {
    return this.authService.logout(headers.authorization);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  getProfile(@Headers() headers) {
    return this.userService.findOneWithAccessToken(headers.authorization);
  }
}
