import { Ranking } from "../domain/ranking.entity";
import { IRankingPort } from "../ports/ranking.port";

export class RankingUseCase{
	constructor(private rankingPort: IRankingPort) {}

	async getAll(): Promise<Ranking[]>{
		return await this.rankingPort.getAll()
	}
	async getRankingByUsername(username: string): Promise<Ranking>{
		return await this.rankingPort.getRankingByUsername(username)
	}
	async getRankingByNick(nick: string): Promise<Ranking>{
		return await this.rankingPort.getRankingByNick(nick)
	}
	async getRankingByPosition(position: number): Promise<Ranking>{
		return await this.rankingPort.getRankingByPosition(position)
	}

	async addRanking(ranking: Ranking): Promise<Ranking>{
		return await this.rankingPort.addRanking(ranking)
	}
	
	async updatePositionByUsername(username: string, newPosition: number): Promise<Ranking>{
		return await this.rankingPort.updatePositionByUsername(username, newPosition)
	}
	async updatePositionByNick(nick: string, newPosition: number): Promise<Ranking>{
		return await this.rankingPort.updatePositionByNick(nick, newPosition)
	}
	async updateImageByUsername(username: string, newImage: string): Promise<Ranking>{
		return await this.rankingPort.updateImageByUsername(username, newImage)
	}
	async updateImageByNick(nick: string, newImage: string): Promise<Ranking>{
		return await this.rankingPort.updateImageByNick(nick, newImage)
	}

	async deleteRanking(username: string): Promise<void>{
		return await this.rankingPort.deleteRanking(username)
	}
}