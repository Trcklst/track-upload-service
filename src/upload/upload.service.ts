import { Injectable } from '@nestjs/common';
import configuration from '../config/configuration';
import { MongoGridFS } from 'mongo-gridfs';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { FILE_EXTENSION, YOUTUBE_VIDEO_URL } from '../constants';
import * as ytdl  from 'ytdl-core';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';

@Injectable()
export class UploadService {
  private fileModel: MongoGridFS;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly rabbitMqService: RabbitMqService
  ) {
    this.fileModel = new MongoGridFS(this.connection.db, configuration.database.dbname);
  }

  async upload(trackId : string) {
    const track = await this.get(trackId);
    if(track) {
      this.rabbitMqService.send('uploaded', {
        trackId: trackId,
        progress: 100
      });
      return;
    }

    let progress = 0;
    const url = YOUTUBE_VIDEO_URL + trackId;
    const trackFile = ytdl(url, {filter: 'audioonly'});

    trackFile.on('error', () => {
      this.rabbitMqService.send('upload-error', { trackId: trackId });
    });

    trackFile.on('progress', (chunkLength, downloaded, total) => {
      const oldProgress = progress;
      progress = Math.floor(((downloaded / total) * 100));
      if(progress != oldProgress && progress % 10 == 0) {
        this.rabbitMqService.send('progress-upload', {
          trackId: trackId,
          progress: progress
        });
      }
    });

    trackFile.on('end', () => {
      this.rabbitMqService.send('uploaded', {
        trackId: trackId,
        progress: progress
      });
    });

    this.fileModel
      .writeFileStream(trackFile, { filename: trackId + FILE_EXTENSION, })
      .catch(() => this.rabbitMqService.send('upload-error', { trackId: trackId }));
  }

  async get(trackId: string) {
      return this.fileModel
        .findOne({filename: trackId + FILE_EXTENSION})
        .then(res => {return {
          _id: res._id,
          filename: res.filename,
          contentType: res.contentType,
        }})
        .catch(() => null);
  }
}
