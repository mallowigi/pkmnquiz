import { useOnline } from '@vueuse/core';
import {
  TwitterAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '@/firebase';
import { i18n } from '@/main.ts';
import { useMessages } from '@/stores/useMessages';
import { useProfile } from '@/stores/useProfile';
import { useSettings } from '@/stores/useSettings';

export const useXAuth = () => {
  const { setName, setAvatar } = useSettings();
  const { fetchProfile } = useProfile();
  const { showUserMessage } = useMessages();

  const authenticateWithX = async () => {
    const online = useOnline();
    if (!online) {
      showUserMessage(i18n.global.t('offlineModeAuthenticate'), 'error');
      return;
    }

    await setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new TwitterAuthProvider();

        signInWithPopup(auth, provider)
          .then(async (result) => {
            const user = result.user;
            let photoURL = await fetchAvatar(user);

            setName(user.displayName ?? 'Trainer');
            setAvatar(photoURL);

            // Fetch and load profile from Firebase
            await fetchProfile();
          })
          .catch((error) => {
            console.error('Auth failed:', error);
            const errorMessage = error.message;
            showUserMessage(errorMessage, 'error');
          });
      })
      .catch((error) => {
        console.error('Persistence failed:', error);
      });
  };

  async function fetchAvatar(user: User) {
    let photoURL = user.photoURL;

    if (photoURL) {
      await updateProfile(user, { photoURL });
    }
    return photoURL;
  }

  return { authenticateWithX };
};
