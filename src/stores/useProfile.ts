import { doc, getDoc, setDoc } from 'firebase/firestore';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { auth, db } from '@/firebase.ts';
import type { Profile } from '@/types';

export const useProfile = defineStore('profile', () => {
  const profileState = reactive<Profile>({
    plays: 0,
  });

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'profiles', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setProfileState(docSnap.data() as Profile);
    }
  };

  const saveUserProfile = async (stats: Partial<Profile>) => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, 'profiles', user.uid), stats, { merge: true });
  };

  const incrementPlays = () => {
    profileState.plays += 1;
    saveUserProfile({ plays: profileState.plays });
  };

  const setProfileState = (profile: Partial<Profile>) => {
    Object.assign(profileState, profile);
  };

  return {
    fetchProfile,
    incrementPlays,
    profileState,
    setProfileState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfile, import.meta.hot));
}
