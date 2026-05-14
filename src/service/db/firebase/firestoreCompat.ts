import {
	collection as clientCollection,
	doc as clientDoc,
	getDocs,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	query as clientQuery,
	where as clientWhere,
	orderBy as clientOrderBy,
	limit as clientLimit,
	DocumentData,
	Firestore,
	QueryConstraint,
} from "firebase/firestore";

type AdminCollectionRef = {
	get: () => Promise<{ docs: { id: string; data: () => DocumentData; exists: boolean }[]; empty: boolean }>;
	doc: (id: string) => AdminDocumentRef;
	where: (field: string, op: string, value: unknown) => AdminCollectionRef;
	orderBy: (field: string, dir?: "asc" | "desc") => AdminCollectionRef;
	limit: (n: number) => AdminCollectionRef;
};

type AdminDocumentRef = {
	get: () => Promise<{ exists: boolean; data: () => DocumentData; id: string }>;
	set: (data: Record<string, unknown>) => Promise<void>;
	update: (data: Record<string, unknown>) => Promise<void>;
	delete: () => Promise<void>;
	collection: (subPath: string) => AdminCollectionRef;
};

export function compatFirestore(db: Firestore): { collection: (path: string) => AdminCollectionRef } {
	return {
		collection(path: string): AdminCollectionRef {
			const constraints: QueryConstraint[] = [];
			let _path = path;

			const buildQuery = () => {
				const colRef = clientCollection(db, _path);
				return constraints.length > 0 ? clientQuery(colRef, ...constraints) : colRef;
			};

			const buildSnapshot = async () => {
				const snapshot = await getDocs(buildQuery());
				return {
					get docs() {
						return snapshot.docs.map((d) => ({
							id: d.id,
							data: () => d.data(),
							get exists() { return d.exists(); },
						}));
					},
					get empty() { return snapshot.empty; },
				};
			};

			const colRef: AdminCollectionRef = {
				get: () => buildSnapshot(),
				doc: (id: string) => {
					return compatDoc(db, `${_path}/${id}`);
				},
				where: (field: string, op: string, value: unknown) => {
					constraints.push(clientWhere(field, op as Parameters<typeof clientWhere>[1], value));
					return colRef;
				},
				orderBy: (field: string, dir?: "asc" | "desc") => {
					constraints.push(clientOrderBy(field, dir));
					return colRef;
				},
				limit: (n: number) => {
					constraints.push(clientLimit(n));
					return colRef;
				},
			};
			return colRef;
		},
	};
}

function compatDoc(db: Firestore, path: string): AdminDocumentRef {
	const docRef = clientDoc(db, path);
	const ref: AdminDocumentRef = {
		get: async () => {
			const snap = await getDoc(docRef);
			return {
				get exists() { return snap.exists(); },
				data: () => snap.data() as DocumentData,
				id: snap.id,
			};
		},
		set: (data: Record<string, unknown>) => setDoc(docRef, data),
		update: (data: Record<string, unknown>) => updateDoc(docRef, data),
		delete: () => deleteDoc(docRef),
		collection: (subPath: string) => compatFirestore(db).collection(`${path}/${subPath}`),
	};
	return ref;
}
