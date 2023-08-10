import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from 'src/entity/board.entity';
import { Member } from 'src/entity/member.entity';
import { Waiting } from 'src/entity/waiting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Member, Waiting])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
