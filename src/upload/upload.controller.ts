import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { RequestUser } from '../user/decorator/user.decorator';
import { UserDto } from '../user/dto/user.dto';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService
  ) {}

  @Post(':id')
  @HttpCode(204)
  async upload(@RequestUser() user: UserDto, @Param('id') trackId : string) {
    await this.uploadService.upload(trackId, user);
    return;
  }

  @Get(':id')
  @HttpCode(200)
  async get(@Param('id') trackId : string) {
    return await this.uploadService.get(trackId);
  }

}
