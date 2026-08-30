import admin from 'firebase-admin';
import { setGlobalOptions, logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

export const cleanupExpiredRooms = onSchedule('every 1 hours', async () => {
  const db = admin.database();
  const roomsRef = db.ref('rooms');
  const expirationThreshold = Date.now() - 60 * 60 * 1000;

  try {
    const snapshot = await roomsRef.get();
    if (!snapshot.exists()) {
      logger.info('No rooms found for cleanup.');
      return;
    }

    const updates: Record<string, null> = {};
    let deletedCount = 0;

    snapshot.forEach((roomSnapshot) => {
      const activeUsersSnapshot = roomSnapshot.child('active_users');
      const ownerId = roomSnapshot.child('ownerId').val();
      const lastActivityAt = roomSnapshot.child('lastActivityAt').val();
      const ownerOnline = typeof ownerId === 'string' && activeUsersSnapshot.child(ownerId).exists();
      const isInactive = !activeUsersSnapshot.exists() || activeUsersSnapshot.numChildren() === 0;
      const isExpired = typeof lastActivityAt === 'number' && lastActivityAt <= expirationThreshold;

      if (!ownerOnline && isInactive && isExpired && roomSnapshot.key) {
        updates[roomSnapshot.key] = null;
        deletedCount++;
      }
    });

    if (deletedCount === 0) {
      logger.info('No expired rooms found for cleanup.');
      return;
    }

    await roomsRef.update(updates);
    logger.info(`Cleaned up ${deletedCount} expired rooms.`);
  } catch (e) {
    logger.error('Error cleaning up expired rooms', e);
  }
});
