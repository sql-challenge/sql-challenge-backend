import { Mystery, MysteryDetail } from "../domain/challenge.entity";

export interface IChallengePort {
  getAll(): Promise<Mystery[]>;
  getById(id: string): Promise<MysteryDetail | null>;
}