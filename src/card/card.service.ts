import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, StateEnum } from 'src/entity/card.entity';
import { Comment } from 'src/entity/comment.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>
  ) {}

  // 카드 목록 가져오기
  async getCard() {
    const result = await this.cardRepository.find({
      where: { deletedAt: null },
      select: ['description'],
    });
    return result;
  }

  // 카드 상세 조회 + 댓글
  async detailCard(card_id: number) {
    const comment = await this.getComment(card_id);
    const card = await this.cardRepository.find({
      where: { deletedAt: null },
      select: ['description', 'createdAt', 'color', 'dueDate', 'state'],
    });
    const result = [...card, ...comment];
    return result;
  }

  // 카드 생성
  createCard(
    name: string,
    color: string,
    description: string,
    dueDate: Date,
    state: StateEnum
  ) {
    this.cardRepository.insert({
      name,
      color,
      description,
      dueDate,
      state,
    });
  }

  // 카드 수정
  async updateCard(
    user_id: number,
    name: string,
    color: string,
    description: string,
    dueDate: Date,
    state: StateEnum
  ) {
    await this.checkCard(user_id);
    this.cardRepository.update(user_id, {
      name,
      color,
      description,
      dueDate,
      state,
    });
  }

  // 카드 삭제
  async deleteCard(card_id: number) {
    await this.checkCard(card_id);
    this.cardRepository.softDelete(card_id);
  }

  // 카드 유무 존재 확인 로직
  private async checkCard(card_id: number) {
    const card = await this.cardRepository.findOne({
      where: { card_id, deletedAt: null },
      select: [],
    });
    if (_.isNil(card)) {
      throw new NotFoundException(`Card not found. id: ${card_id}`);
    }
  }

  // 카드 내 코멘트 가져오는 로직
  private async getComment(card_id: number) {
    return await this.commentRepository.find({
      where: [{ deletedAt: null }, { card_id: card_id }],
      select: ['comment', 'name', 'createdAt', 'updatedAt'],
    });
  }
}
