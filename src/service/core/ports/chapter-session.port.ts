import { ChapterSession, SaveSessionDto } from "../domain/chapter-session.entity";

export interface IChapterSessionPort {
  getSession(uid: string, desafioId: string, capituloId: number): Promise<ChapterSession | null>;
  saveSession(uid: string, desafioId: string, capituloId: number, dto: SaveSessionDto): Promise<ChapterSession>;
}
