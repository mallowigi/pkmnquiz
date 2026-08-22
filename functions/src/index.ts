import admin from 'firebase-admin';
import { setGlobalOptions, logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

export const cleanupExpiredRooms = onSchedule('every 1 hours', async () => {
  const db = admin.database();
  const roomsRef = db.ref('rooms');

  try {
    const snapshot = await roomsRef.get();
    if (!snapshot.exists()) {
      logger.info('No rooms found for cleanup.');
      return;
    }

    const updates: Record<string, any> = {};
    let deletedCount = 0;

    snapshot.forEach((roomSnapshot) => {
      const activeUsersSnapshot = roomSnapshot.child('active_users');

      if (!activeUsersSnapshot.exists() || activeUsersSnapshot.numChildren() === 0) {
        updates[roomSnapshot.key] = null;
        deletedCount++;
      }

      if (deletedCount === 0) {
        logger.info('No expired rooms found for cleanup.');
        return;
      }
    });

    await roomsRef.update(updates);
    logger.info(`Cleaned up ${snapshot.numChildren()} expired rooms.`);
  } catch (e) {
    logger.error('Error cleaning up expired rooms', e);
  }
});
