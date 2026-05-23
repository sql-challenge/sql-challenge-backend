import { Ranking } from "../../../core/domain/ranking.entity";
import { IRankingPort } from "../../../core/ports/ranking.port";
import { db } from "../../../db/firebase/firebaseAdminConfig";

export class RankingFirebaseRepository implements IRankingPort {
	private get rankingCollection() { return db.collection("Ranking"); }

	async getAll(): Promise<Ranking[]> {
		const snapshot = await this.rankingCollection.get();
		return snapshot.docs.map((docSnap) => {
			const data = docSnap.data();
			return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
		});
	}

	async getRankingByUsername(username: string): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("username", "==", username).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
	}

	async getRankingByNick(nick: string): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("nick", "==", nick).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
	}

	async getRankingByPosition(position: number): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("rankingPosition", "==", position).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
	}

	async addRanking(ranking: Ranking): Promise<Ranking> {
		const ref = this.rankingCollection.doc(ranking["username"]);
		await ref.set({
			username: ranking.username,
			nick: ranking.nick,
			imagePerfil: ranking.imagePerfil,
			rankingPosition: ranking.rankingPosition,
		});
		return ranking;
	}

	async updatePositionByUsername(username: string, newPosition: number): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("username", "==", username).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await ref.update({ rankingPosition: newPosition });
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, data.imagePerfil, newPosition);
	}

	async updatePositionByNick(nick: string, newPosition: number): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("nick", "==", nick).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await ref.update({ rankingPosition: newPosition });
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, data.imagePerfil, newPosition);
	}

	async updateImageByUsername(username: string, newImage: string): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("username", "==", username).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await ref.update({ imagePerfil: newImage });
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, newImage, data.rankingPosition);
	}

	async updateImageByNick(nick: string, newImage: string): Promise<Ranking> {
		const snapshot = await this.rankingCollection.where("nick", "==", nick).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await ref.update({ imagePerfil: newImage });
		const data = snapshot.docs[0].data();
		return new Ranking(data.username, data.nick, newImage, data.rankingPosition);
	}

	async deleteRanking(username: string): Promise<void> {
		const snapshot = await this.rankingCollection.where("username", "==", username).get();
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await ref.delete();
	}
}
