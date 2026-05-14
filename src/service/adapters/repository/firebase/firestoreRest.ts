import dotenv from "dotenv";
dotenv.config();

function getBaseUrl(): string {
	const projectId = process.env.projectId || "sqlmystery";
	return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function encodeValue(value: unknown): Record<string, unknown> {
	if (value === null || value === undefined) return { nullValue: null };
	if (value instanceof Date) return { timestampValue: value.toISOString() };
	if (typeof value === "string") return { stringValue: value };
	if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
	if (typeof value === "boolean") return { booleanValue: value };
	if (Array.isArray(value)) {
		return { arrayValue: { values: value.map((v) => encodeValue(v)) } };
	}
	if (typeof value === "object") {
		const fields: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			if (v === null || v === undefined) continue;
			fields[k] = encodeValue(v);
		}
		return { mapValue: { fields } };
	}
	return { stringValue: String(value) };
}

function encodeFields(obj: Record<string, unknown>): Record<string, unknown> {
	const fields: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		const encoded = encodeValue(value);
		if (encoded.nullValue === null) continue;
		fields[key] = encoded;
	}
	return fields;
}

function decodeFields(fields: Record<string, unknown>): Record<string, unknown> {
	const obj: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(fields)) {
		const v = value as Record<string, unknown>;
		if (v.stringValue !== undefined) obj[key] = v.stringValue;
		else if (v.integerValue !== undefined) obj[key] = Number.parseInt(v.integerValue as string, 10);
		else if (v.doubleValue !== undefined) obj[key] = v.doubleValue;
		else if (v.booleanValue !== undefined) obj[key] = v.booleanValue === "true";
		else if (v.timestampValue !== undefined) obj[key] = new Date(v.timestampValue as string);
		else 		if (v.arrayValue) {
			const arr = (v.arrayValue as Record<string, unknown[]>).values;
			obj[key] = arr ? arr.map((el) => decodeFieldValue(el as Record<string, unknown>)) : [];
		} else if (v.mapValue) {
			const mapFields = (v.mapValue as Record<string, Record<string, unknown>>).fields;
			obj[key] = mapFields ? decodeFields(mapFields) : {};
		}
	}
	return obj;
}

function decodeFieldValue(v: Record<string, unknown>): unknown {
	if (v.stringValue !== undefined) return v.stringValue;
	if (v.integerValue !== undefined) return Number.parseInt(v.integerValue as string, 10);
	if (v.doubleValue !== undefined) return v.doubleValue;
	if (v.booleanValue !== undefined) return v.booleanValue === "true";
	if (v.timestampValue !== undefined) return new Date(v.timestampValue as string);
	if (v.arrayValue) {
		const arr = (v.arrayValue as Record<string, unknown[]>).values;
		return arr ? arr.map((el) => decodeFieldValue(el as Record<string, unknown>)) : [];
	}
	if (v.mapValue) {
		const mapFields = (v.mapValue as Record<string, Record<string, unknown>>).fields;
		return mapFields ? decodeFields(mapFields) : {};
	}
	return null;
}

export async function firestoreGetDoc(idToken: string, collection: string, docId: string): Promise<Record<string, unknown> | null> {
	const url = `${getBaseUrl()}/${collection}/${docId}`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`Firestore GET failed: ${res.status} ${await res.text()}`);
	const body = await res.json();
	return { id: body.name?.split("/").pop(), ...decodeFields(body.fields ?? {}) };
}

export async function firestoreSetDoc(idToken: string, collection: string, docId: string, data: Record<string, unknown>): Promise<void> {
	const url = `${getBaseUrl()}/${collection}?documentId=${docId}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
		body: JSON.stringify({ fields: encodeFields(data) }),
	});
	if (!res.ok) throw new Error(`Firestore SET failed: ${res.status} ${await res.text()}`);
}

export async function firestoreUpdateDoc(idToken: string, collection: string, docId: string, data: Record<string, unknown>): Promise<void> {
	const fields = Object.keys(data);
	const mask = fields.map(f => `updateMask.fieldPaths=${f}`).join("&");
	const url = `${getBaseUrl()}/${collection}/${docId}?${mask}`;
	const res = await fetch(url, {
		method: "PATCH",
		headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
		body: JSON.stringify({ fields: encodeFields(data) }),
	});
	if (!res.ok) throw new Error(`Firestore UPDATE failed: ${res.status} ${await res.text()}`);
}

export async function firestoreDeleteDoc(idToken: string, collection: string, docId: string): Promise<void> {
	const url = `${getBaseUrl()}/${collection}/${docId}`;
	const res = await fetch(url, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${idToken}` },
	});
	if (res.status === 404) return;
	if (!res.ok) throw new Error(`Firestore DELETE failed: ${res.status} ${await res.text()}`);
}
