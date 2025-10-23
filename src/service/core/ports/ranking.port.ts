import { Ranking } from "../domain/ranking.entity";

export interface IRankingPort {
	getAll(): Promise<Ranking[]>
	getRankingByUsername(username: string): Promise<Ranking>
	getRankingByNick(nick: string): Promise<Ranking>
	getRankingByPosition(position: number): Promise<Ranking>

	addRanking(ranking: Ranking): Promise<Ranking>

	updatePositionByUsername(username: string, newPosition: number): Promise<Ranking>
	updatePositionByNick(nick: string, newPosition: number): Promise<Ranking>
	updateImageByUsername(username: string, newImage: string): Promise<Ranking>
	updateImageByNick(nick: string, newImage: string): Promise<Ranking>

	deleteRanking(username: string): Promise<void>
}