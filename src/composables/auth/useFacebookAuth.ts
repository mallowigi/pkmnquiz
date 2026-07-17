import { useOnline } from '@vueuse/core';
import {
  FacebookAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/firebase';
import { i18n } from '@/main.ts';
import { useMessages } from '@/stores/useMessages';
import { useProfile } from '@/stores/useProfile';
import { useSettings } from '@/stores/useSettings';

export const useFacebookAuth = () => {
  const { setName, setAvatar } = useSettings();
  const { fetchProfile } = useProfile();
  const { showUserMessage } = useMessages();

  const authenticateWithFacebook = async () => {
    const online = useOnline();
    if (!online) {
      showUserMessage(i18n.global.t('offlineModeAuthenticate'), 'error');
      return;
    }

    await setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new FacebookAuthProvider();

        signInWithPopup(auth, provider)
          .then(async (result) => {
            const user = result.user;
            const photoURL = await fetchAvatar(result);

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

  async function fetchAvatar(result: UserCredential) {
    const user = result.user;

    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const facebookId = user.providerData.find((p) => p.providerId === 'facebook.com')?.uid;

    let photoURL = user.photoURL;

    if (facebookId && accessToken) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/${facebookId}/picture?width=500&height=500&access_token=${accessToken}&redirect=0`,
        );
        const data = await response.json();
        if (data?.data?.url) {
          photoURL = data.data.url;
        }
      } catch (error) {
        console.error('Failed to fetch high-res Facebook photo:', error);
        // Fallback to graph URL if fetch fails
        photoURL = `https://graph.facebook.com/${facebookId}/picture?type=large`;
      }
    }

    if (photoURL && user.photoURL !== photoURL) {
      await updateProfile(user, { photoURL });
    }

    return photoURL;
  }

  return { authenticateWithFacebook };
};
