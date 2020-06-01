import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService
  ) {}

  @Post(':id')
  @HttpCode(204)
  async upload(@Param('id') trackId : string) {
    await this.uploadService.upload(trackId);
    return;
  }

  @Get(':id')
  @HttpCode(200)
  async get(@Param('id') trackId : string) {
    return await this.uploadService.get(trackId);
  }

}
