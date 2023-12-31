import { Injectable, ConflictException } from '@nestjs/common';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from 'src/entity/list.entity';
import { Member } from 'src/entity/member.entity';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List) private listRepository: Repository<List>,
    @InjectRepository(Member) private meberRepository: Repository<Member>,
  ) {}

  // 멤버에 있는지 확인
  async getMemberInfo(user_id: number, board_id: number) {
    return await this.meberRepository.findOne({
      where: { user_id, board_id },
      select: ['user_id'],
    });
  }
  // 리스트 목록 가져오기
  async getList(board_id: number, user_id: number) {
    try {
      const existMember = await this.getMemberInfo(user_id, board_id);
      if (_.isNil(existMember)) {
        throw new ConflictException(`이 보드를 조회 할 권한이 없습니다.`);
      }

      return await this.listRepository.find({
        where: { deletedAt: null, board_id },
        select: ['name', 'list_id', 'order'],
        order: { order: 'ASC' },
      });
    } catch (error) {
      throw error;
    }
  }

  // 리스트 생성
  createList(board_id: number, name: string) {
    this.listRepository.query(
      `INSERT INTO list (board_id, name, \`order\`) VALUES (${board_id}, '${name}', (SELECT COALESCE(max, 1) FROM (SELECT (MAX(\`order\`) + 1) AS max FROM list where board_id = ${board_id}) tmp))`,
    );
  }

  // 리스트 수정
  async updateList(list_id: number, name: string) {
    await this.listRepository.update(list_id, {
      name,
    });
  }

  async updateListOrder(board_id: number, list_id: number, order: number) {
    await this.listRepository.query(
      `UPDATE list SET \`order\` =
            CASE WHEN \`order\` >= ${order} AND list_id != ${list_id} THEN \`order\` + 1
                 WHEN list_id = ${list_id} THEN ${order}
                 ELSE \`order\`
            END
        WHERE board_id = ${board_id};`,
    );
  }

  async deleteList(list_id: number) {
    this.listRepository.softDelete(list_id);
  }
}
