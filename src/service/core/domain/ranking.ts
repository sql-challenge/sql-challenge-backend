export class Ranking {
	private username: string
	private nick: string
	private imagePerfil: string
	private rankingPosition: number

	constructor(username: string, nick: string, imagePerfil: string, rankingPosition: number){
		this.username = username
		this.nick = nick
		this.imagePerfil = imagePerfil
		this.rankingPosition = rankingPosition
	}
}