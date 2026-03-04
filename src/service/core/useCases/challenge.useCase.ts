import {IChallengePort} from "../ports/challenge.port";
import {Mystery, MysteryDetail} from "../domain/challenge.entity";

export class ChallengeUseCase {
  constructor(private challengePort: IChallengePort) {}

  async getAll(): Promise<Mystery[]> {
    return await this.challengePort.getAll();
  }

  async getById(id: string): Promise<MysteryDetail | null> {
    return await this.challengePort.getById(id);
  }
}