import crypto from "node:crypto";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase service account credentials (FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY)"
    );
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(privateKey, "base64url");
  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = (await res.json()) as any;
  if (!data.access_token) {
    throw new Error(
      `Failed to obtain Google access token: ${data.error_description || data.error || "Unknown error"}`
    );
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return cachedToken.token;
}

function getProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "negm-store-3fe8f"
  );
}

function getFirestoreBaseUrl(): string {
  return `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents`;
}

export class FieldValue {
  readonly _type: string;
  readonly _value?: any;

  constructor(type: string, value?: any) {
    this._type = type;
    this._value = value;
  }

  static increment(n: number) {
    return new FieldValue("increment", n);
  }

  static serverTimestamp() {
    return new FieldValue("serverTimestamp");
  }
}

function encodeValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeValue) } };
  }
  if (typeof val === "object") {
    if (val instanceof FieldValue) return val;
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = encodeValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function decodeValue(val: any): any {
  if (!val || typeof val !== "object") return null;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val) {
    return (val.arrayValue?.values || []).map(decodeValue);
  }
  if ("mapValue" in val) {
    const res: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = decodeValue(v);
    }
    return res;
  }
  return null;
}

function extractFieldsAndTransforms(data: any): {
  fields: Record<string, any>;
  fieldTransforms: Array<any>;
} {
  const fields: Record<string, any> = {};
  const fieldTransforms: Array<any> = [];

  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (v instanceof FieldValue) {
      if (v._type === "increment") {
        const num = Number(v._value);
        fieldTransforms.push({
          fieldPath: k,
          increment: Number.isInteger(num) ? { integerValue: String(num) } : { doubleValue: num },
        });
      } else if (v._type === "serverTimestamp") {
        fieldTransforms.push({
          fieldPath: k,
          setToServerValue: "REQUEST_TIME",
        });
      }
    } else {
      fields[k] = encodeValue(v);
    }
  }

  return { fields, fieldTransforms };
}

export interface DocumentSnapshot<T = any> {
  exists: boolean;
  id: string;
  data: () => T | undefined;
}

export interface QuerySnapshot<T = any> {
  empty: boolean;
  size: number;
  docs: DocumentSnapshot<T>[];
}

export class DocumentReference<T = any> {
  readonly collectionPath: string;
  readonly id: string;
  readonly path: string;
  readonly docFullName: string;

  constructor(collectionPath: string, docId: string) {
    this.collectionPath = collectionPath;
    this.id = docId;
    this.path = `${collectionPath}/${docId}`;
    this.docFullName = `projects/${getProjectId()}/databases/(default)/documents/${this.path}`;
  }

  async get(transactionId?: string): Promise<DocumentSnapshot<T>> {
    const token = await getGoogleAccessToken();
    let url = `${getFirestoreBaseUrl()}/${this.path}`;
    if (transactionId) {
      url += `?transaction=${encodeURIComponent(transactionId)}`;
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) {
      return {
        exists: false,
        id: this.id,
        data: () => undefined,
      };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Firestore GET failed (${res.status}): ${JSON.stringify(err)}`);
    }
    const doc = (await res.json()) as any;
    const data: any = {};
    if (doc.fields) {
      for (const [k, v] of Object.entries(doc.fields)) {
        data[k] = decodeValue(v);
      }
    }
    return {
      exists: true,
      id: this.id,
      data: () => data as T,
    };
  }

  _stageSet(stagedWrites: any[], data: any, options?: { merge?: boolean }) {
    const { fields, fieldTransforms } = extractFieldsAndTransforms(data);
    const write: any = {
      update: {
        name: this.docFullName,
        fields,
      },
    };
    if (options?.merge) {
      write.updateMask = { fieldPaths: Object.keys(fields) };
    }
    stagedWrites.push(write);
    if (fieldTransforms.length > 0) {
      stagedWrites.push({
        transform: {
          document: this.docFullName,
          fieldTransforms,
        },
      });
    }
  }

  _stageUpdate(stagedWrites: any[], data: any) {
    const { fields, fieldTransforms } = extractFieldsAndTransforms(data);
    if (Object.keys(fields).length > 0) {
      stagedWrites.push({
        update: {
          name: this.docFullName,
          fields,
        },
        updateMask: { fieldPaths: Object.keys(fields) },
      });
    }
    if (fieldTransforms.length > 0) {
      stagedWrites.push({
        transform: {
          document: this.docFullName,
          fieldTransforms,
        },
      });
    }
  }

  _stageDelete(stagedWrites: any[]) {
    stagedWrites.push({
      delete: this.docFullName,
    });
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    const b = adminDb.batch();
    b.set(this, data, options);
    await b.commit();
  }

  async update(data: any): Promise<void> {
    const b = adminDb.batch();
    b.update(this, data);
    await b.commit();
  }

  async delete(): Promise<void> {
    const b = adminDb.batch();
    b.delete(this);
    await b.commit();
  }
}

export class Query<T = any> {
  readonly collectionPath: string;
  readonly filters: Array<{ field: string; op: string; value: any }>;
  limitCount?: number;

  constructor(
    collectionPath: string,
    filters: Array<{ field: string; op: string; value: any }> = [],
    limitCount?: number
  ) {
    this.collectionPath = collectionPath;
    this.filters = filters;
    this.limitCount = limitCount;
  }

  where(field: string, op: string, value: any): Query<T> {
    return new Query<T>(
      this.collectionPath,
      [...this.filters, { field, op, value }],
      this.limitCount
    );
  }

  limit(count: number): Query<T> {
    return new Query<T>(this.collectionPath, this.filters, count);
  }

  async get(): Promise<QuerySnapshot<T>> {
    const token = await getGoogleAccessToken();
    const projectId = getProjectId();

    const opMap: Record<string, string> = {
      "==": "EQUAL",
      "!=": "NOT_EQUAL",
      "<": "LESS_THAN",
      "<=": "LESS_THAN_OR_EQUAL",
      ">": "GREATER_THAN",
      ">=": "GREATER_THAN_OR_EQUAL",
    };

    let whereClause: any = undefined;
    if (this.filters.length === 1) {
      const f = this.filters[0];
      whereClause = {
        fieldFilter: {
          field: { fieldPath: f.field },
          op: opMap[f.op] || "EQUAL",
          value: encodeValue(f.value),
        },
      };
    } else if (this.filters.length > 1) {
      whereClause = {
        compositeFilter: {
          op: "AND",
          filters: this.filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: opMap[f.op] || "EQUAL",
              value: encodeValue(f.value),
            },
          })),
        },
      };
    }

    const structuredQuery: any = {
      from: [{ collectionId: this.collectionPath }],
    };
    if (whereClause) structuredQuery.where = whereClause;
    if (this.limitCount) structuredQuery.limit = this.limitCount;

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredQuery }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Firestore query failed (${res.status}): ${JSON.stringify(err)}`);
    }

    const items = (await res.json()) as any[];
    const docs: DocumentSnapshot<T>[] = [];

    for (const item of items) {
      if (item.document && item.document.fields) {
        const docName = item.document.name as string;
        const id = docName.split("/").pop() || "";
        const data: any = {};
        for (const [k, v] of Object.entries(item.document.fields)) {
          data[k] = decodeValue(v);
        }
        docs.push({
          exists: true,
          id,
          data: () => data as T,
        });
      }
    }

    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
    };
  }
}

export class CollectionReference<T = any> {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  doc(id: string): DocumentReference<T> {
    return new DocumentReference<T>(this.name, id);
  }

  where(field: string, op: string, value: any): Query<T> {
    return new Query<T>(this.name, [{ field, op, value }]);
  }

  limit(count: number): Query<T> {
    return new Query<T>(this.name, [], count);
  }

  async get(): Promise<QuerySnapshot<T>> {
    return new Query<T>(this.name).get();
  }
}

export interface WriteBatch {
  set(docRef: DocumentReference, data: any, options?: { merge?: boolean }): void;
  update(docRef: DocumentReference, data: any): void;
  delete(docRef: DocumentReference): void;
  commit(): Promise<void>;
}

export interface Transaction {
  get<T = any>(docRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  getAll<T = any>(...docRefs: DocumentReference<T>[]): Promise<DocumentSnapshot<T>[]>;
  set(docRef: DocumentReference, data: any, options?: { merge?: boolean }): void;
  update(docRef: DocumentReference, data: any): void;
  delete(docRef: DocumentReference): void;
}

export const adminDb = {
  collection<T = any>(name: string): CollectionReference<T> {
    return new CollectionReference<T>(name);
  },

  batch(): WriteBatch {
    const stagedWrites: any[] = [];
    return {
      set: (docRef: DocumentReference, data: any, options?: { merge?: boolean }) => {
        docRef._stageSet(stagedWrites, data, options);
      },
      update: (docRef: DocumentReference, data: any) => {
        docRef._stageUpdate(stagedWrites, data);
      },
      delete: (docRef: DocumentReference) => {
        docRef._stageDelete(stagedWrites);
      },
      commit: async () => {
        if (stagedWrites.length === 0) return;
        const token = await getGoogleAccessToken();
        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents:commit`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ writes: stagedWrites }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(`Failed to commit batch writes: ${JSON.stringify(err)}`);
        }
      },
    };
  },

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const token = await getGoogleAccessToken();
    const txRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents:beginTransaction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ options: { readWrite: {} } }),
      }
    );
    if (!txRes.ok) {
      const err = await txRes.json().catch(() => ({}));
      throw new Error(`Failed to begin Firestore transaction: ${JSON.stringify(err)}`);
    }
    const { transaction: transactionId } = (await txRes.json()) as { transaction: string };

    const stagedWrites: any[] = [];
    const txContext: Transaction = {
      get: async <U = any>(docRef: DocumentReference<U>) => docRef.get(transactionId),
      getAll: async <U = any>(...docRefs: DocumentReference<U>[]) =>
        Promise.all(docRefs.map((docRef) => docRef.get(transactionId))),
      set: (docRef: DocumentReference, data: any, options?: { merge?: boolean }) =>
        docRef._stageSet(stagedWrites, data, options),
      update: (docRef: DocumentReference, data: any) => docRef._stageUpdate(stagedWrites, data),
      delete: (docRef: DocumentReference) => docRef._stageDelete(stagedWrites),
    };

    try {
      const result = await updateFunction(txContext);
      const commitRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents:commit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction: transactionId,
            writes: stagedWrites,
          }),
        }
      );
      if (!commitRes.ok) {
        const commitErr = await commitRes.json().catch(() => ({}));
        throw new Error(`Failed to commit transaction: ${JSON.stringify(commitErr)}`);
      }
      return result;
    } catch (err) {
      await fetch(
        `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents:rollback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transaction: transactionId }),
        }
      ).catch(() => {});
      throw err;
    }
  },
};

export interface UserRecord {
  uid: string;
  email?: string;
  emailVerified: boolean;
  providerData: Array<{ providerId: string; [key: string]: any }>;
  [key: string]: any;
}

export const adminAuth = {
  async verifyIdToken(idToken: string) {
    if (!idToken || typeof idToken !== "string") {
      throw new Error("Missing authorization token");
    }
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) {
      throw new Error("Invalid or expired authorization token");
    }
    const data = (await res.json()) as any;
    const user = data.users?.[0];
    if (!user) {
      throw new Error("User corresponding to this token was not found");
    }

    let claims: any = {};
    try {
      const parts = idToken.split(".");
      if (parts[1]) {
        claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      }
    } catch {}

    const providerData = (user.providerUserInfo || []).map((p: any) => ({
      providerId: p.providerId,
      federatedId: p.rawId,
      email: p.email,
      displayName: p.displayName,
      photoUrl: p.photoUrl,
    }));

    return {
      uid: user.localId,
      email: user.email,
      email_verified: Boolean(user.emailVerified),
      emailVerified: Boolean(user.emailVerified),
      providerData,
      ...claims,
    };
  },

  async getUser(uid: string): Promise<UserRecord> {
    if (!uid || typeof uid !== "string") {
      throw new Error("Missing user ID");
    }
    const token = await getGoogleAccessToken();
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${getProjectId()}/accounts:lookup`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ localId: [uid] }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch user (${res.status}): ${JSON.stringify(err)}`);
    }
    const data = (await res.json()) as any;
    const user = data.users?.[0];
    if (!user) {
      throw new Error(`User with ID ${uid} not found`);
    }

    const providerData = (user.providerUserInfo || []).map((p: any) => ({
      providerId: p.providerId,
      federatedId: p.rawId,
      email: p.email,
      displayName: p.displayName,
      photoUrl: p.photoUrl,
    }));

    return {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      providerData,
    };
  },
};