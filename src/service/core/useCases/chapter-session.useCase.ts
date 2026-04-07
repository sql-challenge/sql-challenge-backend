import { ChapterSession, SaveSessionDto } from "../domain/chapter-session.entity";
import { IChapterSessionPort } from "../ports/chapter-session.port";

export class ChapterSessionUseCase {
  constructor(private port: IChapterSessionPort) {}

  async getSession(uid: string, desafioId: string, capituloId: number): Promise<ChapterSession | null> {
    return this.port.getSession(uid, desafioId, capituloId);
  }

  async saveSession(uid: string, desafioId: string, capituloId: number, dto: SaveSessionDto): Promise<ChapterSession> {
    return this.port.saveSession(uid, desafioId, capituloId, dto);
  }
}
