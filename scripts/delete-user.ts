import { getDb } from '../server/db';
import { users, evaluations, recommendations, consultations, consultMessages, consultReports, reviewRequests, consultRatings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);
  console.log('Users:', allUsers.map(u => `${u.id} ${u.email} ${u.name}`));

  const target = allUsers.find(u => u.email && u.email.includes('1960'));
  if (!target) {
    console.log('sarva1960 not found');
    process.exit(0);
  }

  const uid = target.id;
  console.log(`Deleting user ${uid} (${target.email})...`);

  // First get all evaluations and consultations for this user
  const userEvals = await db.select({ id: evaluations.id }).from(evaluations).where(eq(evaluations.userId, uid));
  const evalIds = userEvals.map(e => e.id);
  
  const userConsults = await db.select({ id: consultations.id }).from(consultations).where(eq(consultations.userId, uid));
  const consultIds = userConsults.map(c => c.id);

  // Delete in dependency order
  for (const cid of consultIds) {
    try { await db.delete(consultRatings).where(eq(consultRatings.consultationId, cid)); } catch(e) {}
    try { await db.delete(consultReports).where(eq(consultReports.consultationId, cid)); } catch(e) {}
    try { await db.delete(consultMessages).where(eq(consultMessages.consultationId, cid)); } catch(e) {}
  }
  
  try { await db.delete(reviewRequests).where(eq(reviewRequests.userId, uid)); console.log('  Deleted reviewRequests'); } catch(e) {}
  try { await db.delete(consultations).where(eq(consultations.userId, uid)); console.log('  Deleted consultations'); } catch(e) {}
  
  for (const eid of evalIds) {
    try { await db.delete(recommendations).where(eq(recommendations.evaluationId, eid)); } catch(e) {}
  }
  
  try { await db.delete(evaluations).where(eq(evaluations.userId, uid)); console.log('  Deleted evaluations'); } catch(e) {}
  
  await db.delete(users).where(eq(users.id, uid));
  console.log(`Deleted user ${uid}`);

  const remaining = await db.select({ id: users.id }).from(users);
  console.log(`Remaining users: ${remaining.length}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
