import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardModule } from './board/board.module';
import { TypeOrmConfigService } from './config/typeorm.config.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommentModule } from './comment/comment.module';
import { CardModule } from './card/card.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './config/jwt.config.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ListModule } from './list/list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: JwtConfigService,
      inject: [ConfigService],
    }),
    CacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
    BoardModule,
    UserModule,
    ListModule,
    CommentModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'user/update', method: RequestMethod.PUT },
        { path: 'user', method: RequestMethod.GET },
        { path: 'board', method: RequestMethod.POST },
        { path: 'board', method: RequestMethod.GET },
        { path: 'board/:board_id', method: RequestMethod.GET },
        { path: 'list/:board_id', method: RequestMethod.GET },
        { path: 'board/waiting', method: RequestMethod.GET },
        { path: 'board/waiting/:board_id', method: RequestMethod.DELETE },
        { path: 'board/member/:board_id', method: RequestMethod.POST },
        { path: 'board/waiting/:board_id', method: RequestMethod.POST },
        { path: 'comment/:card_id', method: RequestMethod.POST },
        { path: 'comment/:comment_id', method: RequestMethod.PUT },
        { path: 'comment/:comment_id', method: RequestMethod.DELETE },
      );
  }
}
