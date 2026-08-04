import { useOnline } from '@vueuse/core';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
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

export const useGoogleAuth = () => {
  const { setName, setAvatar } = useSettings();
  const { fetchProfile } = useProfile();
  const { showUserMessage, showErrorMessage } = useMessages();

  const authenticateWithGoogle = async () => {
    const online = useOnline();
    if (!online) {
      showUserMessage(i18n.global.t('offlineModeAuthenticate'), 'error');
      return;
    }

    await setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
          .then(async (result) => {
            const user = result.user;
            const photoURL = await fetchAvatar(user);

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
        showErrorMessage(error, 'Persistence failed');
      });
  };

  async function fetchAvatar(user: User) {
    const photoURL = user.photoURL?.replace(/=s\d+-c/, '=s500-c') || user.photoURL;

    if (photoURL && user.photoURL !== photoURL) {
      await updateProfile(user, { photoURL });
    }
    return photoURL;
  }

  return { authenticateWithGoogle };
};
