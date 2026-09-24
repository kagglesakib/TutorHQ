import { MongoClient, Db, ObjectId } from 'mongodb';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let connectionPromise: Promise<Db> | null = null;
let useMemoryFallback = false;
let activeSource: 'local' | 'global' | 'memory' | null = null;
let migrationCompleted = false;

// Helper: Sanitize double-JSON-encoded dates and strings
export function sanitizeDate(raw: any): Date {
  if (!raw) return new Date();
  if (raw instanceof Date) return isNaN(raw.getTime()) ? new Date() : raw;
  let s = String(raw).trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    try {
      const parsed = JSON.parse(s);
      if (typeof parsed === 'string') s = parsed.trim();
    } catch {}
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function sanitizeDateString(raw: any): string {
  const d = sanitizeDate(raw);
  return d.toISOString();
}

// Helper: Split "Subject - Topic" into separate normalized subject & topic
export function splitSubjectTopic(raw?: string | null): { subject: string; topic: string } {
  if (!raw || !String(raw).trim() || String(raw).trim() === 'N/A') {
    return { subject: '', topic: '' };
  }
  const str = String(raw).trim();
  if (str.includes(' - ')) {
    const parts = str.split(' - ');
    return {
      subject: parts[0].trim(),
      topic: parts.slice(1).join(' - ').trim(),
    };
  }
  if (str.includes(' – ')) { // en-dash
    const parts = str.split(' – ');
    return {
      subject: parts[0].trim(),
      topic: parts.slice(1).join(' – ').trim(),
    };
  }
  if (str.includes('-')) {
    const parts = str.split('-');
    return {
      subject: parts[0].trim(),
      topic: parts.slice(1).join('-').trim(),
    };
  }
  return { subject: str, topic: '' };
}

// Helper: Determine admin account
export function isAdminAccount(doc: any): boolean {
  if (!doc) return false;
  if (doc.userType === 'admin') return true;
  const sid = String(doc.sid || '').trim().toUpperCase();
  if (sid === 'ADMIN' || sid === '0000000' || sid === '0') return true;
  const email = String(doc.email || '').trim().toLowerCase();
  if (
    email === 'sakib1514817122@gmail.com' ||
    email === 'sakibhasan.office@gmail.com' ||
    email === 'kagglesakib@gmail.com'
  ) return true;
  const name = String(doc.name || '').trim().toLowerCase();
  if (name === 'sakibul hasan' || name.includes('sakibul hasan')) return true;
  return false;
}

// In-Memory Storage for offline/fallback mode
const inMemoryData: Record<string, any[]> = {
  admins: [
    {
      _id: new ObjectId(),
      email: 'sakib1514817122@gmail.com',
      password: 'admin',
      name: 'Sakibul Hasan',
      phone: '01516518418',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  students: [],
  activities: [],
  exams: [],
  payments: [],
};

function matchFilter(item: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  if (query.$or && Array.isArray(query.$or)) {
    return query.$or.some((subQuery: any) => matchFilter(item, subQuery));
  }
  if (query.$and && Array.isArray(query.$and)) {
    return query.$and.every((subQuery: any) => matchFilter(item, subQuery));
  }

  return Object.entries(query).every(([key, expectedVal]) => {
    if (key === '$or' || key === '$and') return true;
    const actualVal = item[key];

    if (expectedVal instanceof RegExp) {
      return expectedVal.test(String(actualVal ?? ''));
    }

    if (expectedVal !== null && typeof expectedVal === 'object') {
      if ('$in' in expectedVal && Array.isArray(expectedVal.$in)) {
        return expectedVal.$in.some((candidate: any) => {
          if (candidate instanceof ObjectId || actualVal instanceof ObjectId) {
            return String(candidate) === String(actualVal);
          }
          return candidate === actualVal;
        });
      }
      if ('$nin' in expectedVal && Array.isArray(expectedVal.$nin)) {
        return !expectedVal.$nin.some((candidate: any) => {
          if (candidate instanceof ObjectId || actualVal instanceof ObjectId) {
            return String(candidate) === String(actualVal);
          }
          return candidate === actualVal;
        });
      }
      if ('$ne' in expectedVal) {
        if (expectedVal.$ne instanceof ObjectId || actualVal instanceof ObjectId) {
          return String(expectedVal.$ne) !== String(actualVal);
        }
        return actualVal !== expectedVal.$ne;
      }
      if ('$regex' in expectedVal) {
        const regex = expectedVal.$regex instanceof RegExp ? expectedVal.$regex : new RegExp(String(expectedVal.$regex), (expectedVal as any).$options || '');
        return regex.test(String(actualVal ?? ''));
      }
    }

    if (expectedVal instanceof ObjectId || actualVal instanceof ObjectId) {
      return String(expectedVal) === String(actualVal);
    }

    return actualVal === expectedVal;
  });
}

function createMemoryCollection(colName: string) {
  if (!inMemoryData[colName]) {
    inMemoryData[colName] = [];
  }

  return {
    createIndex: async () => true,
    createIndexes: async () => true,
    countDocuments: async (query: any = {}) => {
      const matched = inMemoryData[colName].filter((item) => matchFilter(item, query));
      return matched.length;
    },
    find: (query: any = {}, options?: any) => {
      let results = inMemoryData[colName].filter((item) => matchFilter(item, query));

      let sortField: string | null = null;
      let sortOrder = 1;
      let limitVal: number | null = null;

      const cursor = {
        sort: (sortObj: any) => {
          const keys = Object.keys(sortObj);
          if (keys.length > 0) {
            sortField = keys[0];
            sortOrder = sortObj[sortField] === -1 ? -1 : 1;
          }
          return cursor;
        },
        limit: (n: number) => {
          limitVal = n;
          return cursor;
        },
        toArray: async () => {
          let list = [...results];
          if (sortField) {
            list.sort((a, b) => {
              const valA = a[sortField!] ?? '';
              const valB = b[sortField!] ?? '';
              if (valA < valB) return -1 * sortOrder;
              if (valA > valB) return 1 * sortOrder;
              return 0;
            });
          }
          if (limitVal !== null && limitVal >= 0) {
            list = list.slice(0, limitVal);
          }
          return list.map((item) => ({ ...item }));
        },
      };

      return cursor;
    },
    findOne: async (query: any = {}, options?: any) => {
      const match = inMemoryData[colName].find((item) => matchFilter(item, query));
      return match ? { ...match } : null;
    },
    insertOne: async (doc: any) => {
      const newDoc = {
        _id: doc._id || new ObjectId(),
        ...doc,
      };
      inMemoryData[colName].push(newDoc);
      return { insertedId: newDoc._id, acknowledged: true };
    },
    insertMany: async (docs: any[]) => {
      const insertedDocs = docs.map((d) => ({
        _id: d._id || new ObjectId(),
        ...d,
      }));
      inMemoryData[colName].push(...insertedDocs);
      return { insertedCount: insertedDocs.length, acknowledged: true };
    },
    updateOne: async (query: any, update: any, options?: any) => {
      const idx = inMemoryData[colName].findIndex((item) => matchFilter(item, query));
      if (idx !== -1) {
        if (update.$set) {
          inMemoryData[colName][idx] = {
            ...inMemoryData[colName][idx],
            ...update.$set,
          };
        }
        return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
      }
      if (options?.upsert) {
        const newDoc = {
          _id: new ObjectId(),
          ...(query.sid ? { sid: query.sid } : {}),
          ...(query.email ? { email: query.email } : {}),
          ...(update.$set || {}),
        };
        inMemoryData[colName].push(newDoc);
        return { matchedCount: 0, modifiedCount: 0, upsertedId: newDoc._id, acknowledged: true };
      }
      return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
    },
    updateMany: async (query: any, update: any) => {
      let count = 0;
      inMemoryData[colName].forEach((item, idx) => {
        if (matchFilter(item, query)) {
          if (update.$set) {
            inMemoryData[colName][idx] = { ...inMemoryData[colName][idx], ...update.$set };
          }
          count++;
        }
      });
      return { matchedCount: count, modifiedCount: count, acknowledged: true };
    },
    findOneAndUpdate: async (query: any, update: any, options?: any) => {
      const idx = inMemoryData[colName].findIndex((item) => matchFilter(item, query));
      if (idx !== -1) {
        if (update.$set) {
          inMemoryData[colName][idx] = {
            ...inMemoryData[colName][idx],
            ...update.$set,
          };
        }
        return { ...inMemoryData[colName][idx] };
      }
      return null;
    },
    deleteOne: async (query: any) => {
      const idx = inMemoryData[colName].findIndex((item) => matchFilter(item, query));
      if (idx !== -1) {
        inMemoryData[colName].splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    deleteMany: async (query: any) => {
      const initial = inMemoryData[colName].length;
      inMemoryData[colName] = inMemoryData[colName].filter((doc) => !matchFilter(doc, query));
      return { deletedCount: initial - inMemoryData[colName].length };
    },
  };
}

function getMemoryDb(): any {
  return {
    databaseName: 'TutorHQ-InMemory',
    collection: (colName: string) => createMemoryCollection(colName),
  };
}

export function getActiveDatabaseSource() {
  return activeSource;
}

/**
 * Creates indexes as defined in the normalized schema specification:
 * - admins: email (unique)
 * - students: sid (unique), email (unique)
 * - activities: studentId + date (compound)
 * - exams: studentId + date (compound)
 * - payments: studentId + paymentMonth (compound)
 */
async function ensureNormalizedIndexes(db: Db) {
  try {
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');
    const activitiesCol = db.collection('activities');
    const examsCol = db.collection('exams');
    const paymentsCol = db.collection('payments');

    await Promise.allSettled([
      adminsCol.createIndex({ email: 1 }, { unique: true }),
      studentsCol.createIndex({ sid: 1 }, { unique: true, sparse: true }),
      studentsCol.createIndex({ email: 1 }, { unique: true, sparse: true }),
      activitiesCol.createIndex({ studentId: 1, date: -1 }),
      examsCol.createIndex({ studentId: 1, date: -1 }),
      paymentsCol.createIndex({ studentId: 1, paymentMonth: -1 }),
    ]);
    console.log('✅ Normalized MongoDB indexes ensured.');
  } catch (err) {
    console.warn('⚠️ Notice while creating indexes:', err);
  }
}

/**
 * Migration routine: Restructures legacy schema into Normalized MongoDB Schema:
 */
export async function migrateToNormalizedSchema(db: Db): Promise<void> {
  if (migrationCompleted) return;

  try {
    const studentsCol = db.collection('students');
    const studentCount = typeof studentsCol.countDocuments === 'function' ? await studentsCol.countDocuments() : 0;
    if (studentCount > 0) {
      migrationCompleted = true;
      await ensureNormalizedIndexes(db);
      return;
    }

    console.log('🔄 Checking & executing schema normalization migration...');
    const adminsCol = db.collection('admins');
    const activitiesCol = db.collection('activities');
    const examsCol = db.collection('exams');
    const paymentsCol = db.collection('payments');
    const legacyUsersCol = db.collection('users');

    // Ensure default primary admin exists
    const existingAdmin = await adminsCol.findOne({ email: 'sakib1514817122@gmail.com' });
    if (!existingAdmin) {
      await adminsCol.updateOne(
        { email: 'sakib1514817122@gmail.com' },
        {
          $set: {
            email: 'sakib1514817122@gmail.com',
            password: 'admin',
            name: 'Sakibul Hasan',
            phone: '01516518418',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    // Check if legacy users collection exists and has records
    let legacyUsers: any[] = [];
    try {
      legacyUsers = await legacyUsersCol.find({}).toArray();
    } catch {}

    const existingStudents = await studentsCol.find({}).toArray();

    // 1. Migrate Admin accounts from legacy users
    for (const u of legacyUsers) {
      if (isAdminAccount(u)) {
        const adminEmail = (u.email || 'sakib1514817122@gmail.com').trim().toLowerCase();
        await adminsCol.updateOne(
          { email: adminEmail },
          {
            $set: {
              email: adminEmail,
              password: u.password || 'admin',
              name: u.name || 'Sakibul Hasan',
              phone: u.phone || u.mobile || '01516518418',
              status: 'active',
              createdAt: sanitizeDate(u.createdAt),
              updatedAt: sanitizeDate(u.updatedAt || new Date()),
            },
          },
          { upsert: true }
        );
      }
    }

    // 2. Build unified Student map from legacy users (non-admin) and students collection
    const studentMap = new Map<string, any>(); // key: UPPER(sid) or lower(email)

    const processStudentDoc = (doc: any) => {
      if (isAdminAccount(doc)) return;

      const sid = String(doc.sid || '').trim().toUpperCase();
      const email = String(doc.email || '').trim().toLowerCase();
      const key = sid ? `sid:${sid}` : (email ? `email:${email}` : `id:${doc._id}`);

      const existing = studentMap.get(key);
      const docUpdated = sanitizeDate(doc.updatedAt || doc.createdAt);
      const existUpdated = existing ? sanitizeDate(existing.updatedAt || existing.createdAt) : new Date(0);

      // Status resolution
      const rawApproval = doc.approved ?? doc.isApproved ?? existing?.approved ?? existing?.isApproved;
      let finalStatus: 'active' | 'revoked' | 'pending' = 'pending';
      if (rawApproval === 'no' || rawApproval === 'disapproved' || rawApproval === 'rejected' || rawApproval === false) {
        finalStatus = 'revoked';
      } else if (rawApproval === 'yes' || rawApproval === 'approved' || rawApproval === true) {
        finalStatus = 'active';
      } else if (sid) {
        finalStatus = 'active';
      } else {
        finalStatus = 'pending';
      }

      const mergedPhone = (doc.phone || doc.mobile || existing?.phone || existing?.mobile || '').trim();

      const merged = {
        _id: existing?._id || (ObjectId.isValid(doc._id) ? new ObjectId(doc._id) : new ObjectId()),
        sid: sid || existing?.sid || '',
        name: (docUpdated >= existUpdated ? doc.name : existing?.name) || doc.name || existing?.name || 'Student',
        email: email || existing?.email || '',
        password: doc.password || existing?.password || 'student123',
        phone: mergedPhone,
        status: finalStatus,
        college: (docUpdated >= existUpdated ? doc.college : existing?.college) || doc.college || existing?.college || '',
        hscBatch: (docUpdated >= existUpdated ? doc.hscBatch : existing?.hscBatch) || doc.hscBatch || existing?.hscBatch || '',
        group: (docUpdated >= existUpdated ? doc.group : existing?.group) || doc.group || existing?.group || '',
        subject: (docUpdated >= existUpdated ? doc.subject : existing?.subject) || doc.subject || existing?.subject || '',
        guardiansPhone: (docUpdated >= existUpdated ? doc.guardiansPhone : existing?.guardiansPhone) || doc.guardiansPhone || existing?.guardiansPhone || '',
        address: (docUpdated >= existUpdated ? doc.address : existing?.address) || doc.address || existing?.address || '',
        createdAt: sanitizeDate(existing?.createdAt || doc.createdAt),
        updatedAt: sanitizeDate(doc.updatedAt || new Date()),
      };

      studentMap.set(key, merged);
    };

    // Process legacy student rows first, then students collection
    for (const u of legacyUsers) {
      processStudentDoc(u);
    }
    for (const s of existingStudents) {
      processStudentDoc(s);
    }

    // 3. Write merged students to normalized students collection
    for (const student of Array.from(studentMap.values())) {
      if (!student.sid) continue; // Must have an SID in students collection

      await studentsCol.updateOne(
        { sid: student.sid },
        {
          $set: {
            sid: student.sid,
            name: student.name,
            email: student.email,
            password: student.password,
            phone: student.phone,
            status: student.status,
            college: student.college,
            hscBatch: student.hscBatch,
            group: student.group,
            subject: student.subject,
            guardiansPhone: student.guardiansPhone,
            address: student.address,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
          },
          $setOnInsert: {
            _id: student._id,
          },
        },
        { upsert: true }
      );
    }

    // Remove any rogue admin documents that were inside students collection
    await studentsCol.deleteMany({
      $or: [
        { sid: { $in: ['ADMIN', 'admin', '0000000', '0'] } },
        { email: { $in: ['sakib1514817122@gmail.com', 'sakibhasan.office@gmail.com', 'kagglesakib@gmail.com'] } },
        { name: { $regex: /sakibul\s+hasan/i } },
      ],
    });

    // 4. Build SID -> ObjectId mapping from the normalized students collection
    const currentStudents = await studentsCol.find({}).toArray();
    const sidToStudentId = new Map<string, ObjectId>();
    for (const s of currentStudents) {
      if (s.sid) {
        sidToStudentId.set(String(s.sid).trim().toUpperCase(), s._id);
      }
    }

    // 5. Migrate Activities:
    // - Rewrite studentSid to studentId (ObjectId FK)
    // - Split subjectTuitioned into subject & topic
    // - Repair double-encoded dates
    const allActivities = await activitiesCol.find({}).toArray();
    for (const act of allActivities) {
      const updates: any = {};

      // Foreign key link
      if (!act.studentId && act.studentSid) {
        const studentObjId = sidToStudentId.get(String(act.studentSid).trim().toUpperCase());
        if (studentObjId) {
          updates.studentId = studentObjId;
        }
      }

      // Split subject and topic
      if (act.subjectTuitioned && (!act.subject || !act.topic)) {
        const { subject, topic } = splitSubjectTopic(act.subjectTuitioned);
        updates.subject = act.subject || subject;
        updates.topic = act.topic || topic;
      }

      // Sanitize dates
      if (act.date && typeof act.date === 'string' && act.date.startsWith('"')) {
        updates.date = sanitizeDate(act.date);
      }
      if (act.createdAt) {
        updates.createdAt = sanitizeDate(act.createdAt);
      }

      if (Object.keys(updates).length > 0) {
        await activitiesCol.updateOne({ _id: act._id }, { $set: updates });
      }
    }

    // 6. Migrate Exams:
    // - Rewrite studentSid to studentId (ObjectId FK)
    // - Split subjectAndTopic into subject & topic
    // - Repair dates
    const allExams = await examsCol.find({}).toArray();
    for (const ex of allExams) {
      const updates: any = {};

      if (!ex.studentId && ex.studentSid) {
        const studentObjId = sidToStudentId.get(String(ex.studentSid).trim().toUpperCase());
        if (studentObjId) {
          updates.studentId = studentObjId;
        }
      }

      if (ex.subjectAndTopic && (!ex.subject || !ex.topic)) {
        const { subject, topic } = splitSubjectTopic(ex.subjectAndTopic);
        updates.subject = ex.subject || subject;
        updates.topic = ex.topic || topic;
      }

      if (ex.date && typeof ex.date === 'string' && ex.date.startsWith('"')) {
        updates.date = sanitizeDate(ex.date);
      }
      if (ex.createdAt) {
        updates.createdAt = sanitizeDate(ex.createdAt);
      }

      if (Object.keys(updates).length > 0) {
        await examsCol.updateOne({ _id: ex._id }, { $set: updates });
      }
    }

    // 7. Migrate Payments:
    // - Rewrite studentSid to studentId (ObjectId FK)
    // - Repair dates
    const allPayments = await paymentsCol.find({}).toArray();
    for (const pay of allPayments) {
      const updates: any = {};

      if (!pay.studentId && pay.studentSid) {
        const studentObjId = sidToStudentId.get(String(pay.studentSid).trim().toUpperCase());
        if (studentObjId) {
          updates.studentId = studentObjId;
        }
      }

      if (pay.date && typeof pay.date === 'string' && pay.date.startsWith('"')) {
        updates.date = sanitizeDate(pay.date);
      }
      if (pay.createdAt) {
        updates.createdAt = sanitizeDate(pay.createdAt);
      }

      if (Object.keys(updates).length > 0) {
        await paymentsCol.updateOne({ _id: pay._id }, { $set: updates });
      }
    }

    // Ensure Indexes
    await ensureNormalizedIndexes(db);

    migrationCompleted = true;
    console.log(`✅ Normalized schema migration complete. Synced ${currentStudents.length} students, admins, activities, exams, and payments.`);
  } catch (err) {
    console.error('Migration error:', err);
  }
}

export async function connectMongoDB(): Promise<Db> {
  if (mongoDb && !useMemoryFallback) {
    if (!migrationCompleted) {
      migrateToNormalizedSchema(mongoDb).catch(console.error);
    }
    return mongoDb;
  }

  // Local MongoDB URIs
  const localUri = (
    process.env.MONGODB_LOCAL_URI ||
    process.env.MONGO_COMPASS_URI ||
    process.env.LOCAL_MONGO_URI ||
    ''
  ).trim();

  // Global MongoDB URIs
  const globalUri = (
    process.env.MONGODB_GLOBAL_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.GLOBAL_MONGO_URI ||
    process.env.MONGODB_URI ||
    ''
  ).trim();

  // Check if running during Next.js production build phase
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';

  if (isBuildTime && !localUri && !globalUri) {
    useMemoryFallback = true;
    activeSource = 'memory';
    return getMemoryDb() as Db;
  }

  if (localUri || globalUri) {
    useMemoryFallback = false;
  } else if (useMemoryFallback) {
    const memDb = getMemoryDb() as Db;
    if (!migrationCompleted) {
      migrateToNormalizedSchema(memDb).catch(console.error);
    }
    return memDb;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const globalTimeout = isBuildTime ? 2000 : 8000;
  const localTimeout = isBuildTime ? 1500 : 2500;

  connectionPromise = (async () => {
    function parseDbName(uri: string): string | undefined {
      try {
        const formattedUri = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')
          ? uri
          : `mongodb://${uri}`;
        const urlObj = new URL(formattedUri);
        const pathPart = urlObj.pathname.replace(/^\//, '').trim();
        if (pathPart) {
          const name = pathPart.split('/')[0].split('?')[0].trim();
          if (name) return name;
        }
      } catch {}
      return undefined;
    }

    // 1. Try Global MongoDB (Atlas) first if specified
    if (globalUri) {
      try {
        console.log('🔄 Attempting connection to Global MongoDB (Atlas)...');
        const client = new MongoClient(globalUri, {
          serverSelectionTimeoutMS: globalTimeout,
          connectTimeoutMS: globalTimeout,
        });
        await client.connect();

        const dbName = parseDbName(globalUri);
        mongoClient = client;
        mongoDb = client.db(dbName);
        activeSource = 'global';
        useMemoryFallback = false;
        console.log(`✅ Connected to Global MongoDB (Atlas). Database: "${mongoDb.databaseName}"`);
        migrateToNormalizedSchema(mongoDb).catch(console.error);
        return mongoDb;
      } catch (err: any) {
        console.warn(`⚠️ Global MongoDB connection failed (${err?.message || err}). Trying Local MongoDB if available...`);
      }
    }

    // 2. Try Local MongoDB if global fails or is missing
    if (localUri) {
      try {
        console.log('🔄 Attempting connection to Local MongoDB...');
        const client = new MongoClient(localUri, {
          serverSelectionTimeoutMS: 2500,
          connectTimeoutMS: 2500,
        });
        await client.connect();

        const dbName = parseDbName(localUri);
        mongoClient = client;
        mongoDb = client.db(dbName);
        activeSource = 'local';
        useMemoryFallback = false;
        console.log(`✅ Connected to Local MongoDB. Database: "${mongoDb.databaseName}"`);
        migrateToNormalizedSchema(mongoDb).catch(console.error);
        return mongoDb;
      } catch (err: any) {
        console.warn(`⚠️ Local MongoDB connection unavailable (${err?.message || err}).`);
      }
    }

    // 3. Fallback to clean in-memory store
    console.warn('⚠️ No active database connection could be established. Using clean normalized in-memory store.');
    useMemoryFallback = true;
    activeSource = 'memory';
    const memDb = getMemoryDb() as Db;
    migrateToNormalizedSchema(memDb).catch(console.error);
    return memDb;
  })().catch((err) => {
    connectionPromise = null;
    useMemoryFallback = true;
    activeSource = 'memory';
    const memDb = getMemoryDb() as Db;
    migrateToNormalizedSchema(memDb).catch(console.error);
    return memDb;
  });

  return connectionPromise;
}

export async function getMongoDb(): Promise<Db> {
  return connectMongoDB();
}
