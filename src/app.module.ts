import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { UserMiddleware } from './user/middleware/user.middleware';
import { JwtModule } from '@nestjs/jwt';
import { EurekaModule } from 'nestjs-eureka';

import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
const Eureka = require('eureka-js-client').Eureka;

@Module({
  imports: [
    MongooseModule.forRoot(configuration.database.host, {
      useNewUrlParser: true,
      user: configuration.database.user,
      pass: configuration.database.password,
      dbName: configuration.database.dbname
    }),
    JwtModule.register({ secret: configuration.jwtSecret }),
    EurekaModule.forRoot({
      eureka: new Eureka({instance: configuration.eurekaClient.instance, eureka: configuration.eurekaClient.eureka }),
      disableDiscovery: Boolean(configuration.eurekaClient.enable),
      disable: Boolean(configuration.eurekaClient.enable),
    }),
    UploadModule,
    UserModule,
    RabbitMqModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
