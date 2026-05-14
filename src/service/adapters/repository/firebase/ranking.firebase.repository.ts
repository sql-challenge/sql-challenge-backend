import { collection, getDocs, doc, query, where, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Ranking } from "../../../core/domain/ranking.entity";
import { IRankingPort } from "../../../core/ports/ranking.port";
import { db } from "../../../db/firebase/firebaseConfig";

export class RankingFirebaseRepository implements IRankingPort {
	private get rankingCollection() { return collection(db, "Ranking"); }

	async getAll(): Promise<Ranking[]> {
		try {
			const snapshot = await getDocs(this.rankingCollection);
			return snapshot.docs.map((docSnap) => {
				const data = docSnap.data();
				return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
			});
		} catch (err) {
			console.error(`[Firebase] Ranking getAll: requires Admin SDK credentials — ${(err as Error).message}`);
			return [];
		}
	}

	async getRankingByUsername(username: string): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("username", "==", username));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking getRankingByUsername: ${(err as Error).message}`);
			throw err;
		}
	}

	async getRankingByNick(nick: string): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("nick", "==", nick));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking getRankingByNick: ${(err as Error).message}`);
			throw err;
		}
	}

	async getRankingByPosition(position: number): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("rankingPosition", "==", position));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, data.imagePerfil, data.rankingPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking getRankingByPosition: ${(err as Error).message}`);
			throw err;
		}
	}

	async addRanking(ranking: Ranking): Promise<Ranking> {
		try {
			const ref = doc(this.rankingCollection, ranking["username"]);
			await setDoc(ref, {
				username: ranking.username,
				nick: ranking.nick,
				imagePerfil: ranking.imagePerfil,
				rankingPosition: ranking.rankingPosition,
			});
			return ranking;
		} catch (err) {
			console.error(`[Firebase] Ranking addRanking: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}

	async updatePositionByUsername(username: string, newPosition: number): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("username", "==", username));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const ref = snapshot.docs[0].ref;
			await updateDoc(ref, { rankingPosition: newPosition });
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, data.imagePerfil, newPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking updatePositionByUsername: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}

	async updatePositionByNick(nick: string, newPosition: number): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("nick", "==", nick));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const ref = snapshot.docs[0].ref;
			await updateDoc(ref, { rankingPosition: newPosition });
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, data.imagePerfil, newPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking updatePositionByNick: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}

	async updateImageByUsername(username: string, newImage: string): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("username", "==", username));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const ref = snapshot.docs[0].ref;
			await updateDoc(ref, { imagePerfil: newImage });
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, newImage, data.rankingPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking updateImageByUsername: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}

	async updateImageByNick(nick: string, newImage: string): Promise<Ranking> {
		try {
			const q = query(this.rankingCollection, where("nick", "==", nick));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const ref = snapshot.docs[0].ref;
			await updateDoc(ref, { imagePerfil: newImage });
			const data = snapshot.docs[0].data();
			return new Ranking(data.username, data.nick, newImage, data.rankingPosition);
		} catch (err) {
			console.error(`[Firebase] Ranking updateImageByNick: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}

	async deleteRanking(username: string): Promise<void> {
		try {
			const q = query(this.rankingCollection, where("username", "==", username));
			const snapshot = await getDocs(q);
			if (snapshot.empty) throw new Error("Ranking not found!");
			const ref = snapshot.docs[0].ref;
			await deleteDoc(ref);
		} catch (err) {
			console.error(`[Firebase] Ranking deleteRanking: requires Admin SDK credentials — ${(err as Error).message}`);
			throw err;
		}
	}
}
