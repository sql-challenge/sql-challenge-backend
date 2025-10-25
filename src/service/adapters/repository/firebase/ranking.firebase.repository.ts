import { collection, getDocs, getDoc, doc, query, where, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Ranking } from "../../../core/domain/ranking.entity";
import { IRankingPort } from "../../../core/ports/ranking.port";
import { db } from "../../../db/firebase/firebaseConfig";

export class RankingFirebaseRepository implements IRankingPort {
	private rankingCollection = collection(db, "Ranking");

	// Retorna todos os rankings
	async getAll(): Promise<Ranking[]> {
		const snapshot = await getDocs(this.rankingCollection);
		return snapshot.docs.map((docSnap) => {
			const data = docSnap.data();
			return new Ranking(
				data.username,
				data.nick,
				data.imagePerfil,
				data.rankingPosition
			);
		});
	}

	// Retorna um ranking pelo username
	async getRankingByUsername(username: string): Promise<Ranking> {
		const q = query(this.rankingCollection, where("username", "==", username));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			data.imagePerfil,
			data.rankingPosition
		);
	}

	// Retorna um ranking pelo nick
	async getRankingByNick(nick: string): Promise<Ranking> {
		const q = query(this.rankingCollection, where("nick", "==", nick));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			data.imagePerfil,
			data.rankingPosition
		);
	}

	// Retorna um ranking pela posição
	async getRankingByPosition(position: number): Promise<Ranking> {
		const q = query(this.rankingCollection, where("rankingPosition", "==", position));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			data.imagePerfil,
			data.rankingPosition
		);
	}

	// Adiciona um novo ranking
	async addRanking(ranking: Ranking): Promise<Ranking> {
		const ref = doc(this.rankingCollection, ranking["username"]); // usa username como ID
		await setDoc(ref, {
			username: (ranking as any).username,
			nick: (ranking as any).nick,
			imagePerfil: (ranking as any).imagePerfil,
			rankingPosition: (ranking as any).rankingPosition
		});
		return ranking;
	}

	// Atualiza a posição com base no username
	async updatePositionByUsername(username: string, newPosition: number): Promise<Ranking> {
		const q = query(this.rankingCollection, where("username", "==", username));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await updateDoc(ref, { rankingPosition: newPosition });

		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			data.imagePerfil,
			newPosition
		);
	}

	// Atualiza a posição com base no nick
	async updatePositionByNick(nick: string, newPosition: number): Promise<Ranking> {
		const q = query(this.rankingCollection, where("nick", "==", nick));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await updateDoc(ref, { rankingPosition: newPosition });

		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			data.imagePerfil,
			newPosition
		);
	}

	// Atualiza a imagem com base no username
	async updateImageByUsername(username: string, newImage: string): Promise<Ranking> {
		const q = query(this.rankingCollection, where("username", "==", username));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await updateDoc(ref, { imagePerfil: newImage });

		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			newImage,
			data.rankingPosition
		);
	}

	// Atualiza a imagem com base no nick
	async updateImageByNick(nick: string, newImage: string): Promise<Ranking> {
		const q = query(this.rankingCollection, where("nick", "==", nick));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await updateDoc(ref, { imagePerfil: newImage });

		const data = snapshot.docs[0].data();
		return new Ranking(
			data.username,
			data.nick,
			newImage,
			data.rankingPosition
		);
	}

	// Deleta um ranking com base no username
	async deleteRanking(username: string): Promise<void> {
		const q = query(this.rankingCollection, where("username", "==", username));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error("Ranking not found!");
		const ref = snapshot.docs[0].ref;
		await deleteDoc(ref);
	}
}
