import { useOnline } from '@vueuse/core';
import { useFirestore } from '@vueuse/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  deleteDoc,
  Query,
} from 'firebase/firestore';
import { storeToRefs, acceptHMRUpdate, defineStore } from 'pinia';
import { reactive } from 'vue';

import { useFacebookAuth } from '@/composables/auth/useFacebookAuth.ts';
import { useGithubAuth } from '@/composables/auth/useGithubAuth.ts';
import { useGoogleAuth } from '@/composables/auth/useGoogleAuth.ts';
import { useXAuth } from '@/composables/auth/useXAuth.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { auth, db } from '@/firebase.ts';
import { i18n } from '@/main.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useProfile } from '@/stores/useProfile.ts';
import { useSettings } from '@/stores/useSettings.ts';
import { useTimer } from '@/stores/useTimer.ts';
import type { UserRecord, GameMode, Gen, Mode, Type, SaveData, TopTrainer } from '@/types.ts';

type TopTrainersOptions = {
  gameMode?: GameMode | null;
  gen?: Gen | null;
  limit?: number;
  mode?: Mode | null;
  type?: Type | null;
  uid?: string | null;
};

export const useFirebase = defineStore('firebase', () => {
  const { setName, setAvatar } = useSettings();
  const { showUserMessage, showErrorMessage } = useMessages();
  const { authenticateWithGoogle } = useGoogleAuth();
  const { authenticateWithGithub } = useGithubAuth();
  const { authenticateWithFacebook } = useFacebookAuth();
  const { authenticateWithX } = useXAuth();

  onAuthStateChanged(auth, async (user) => {
    const { fetchProfile, setProfileState } = useProfile();
    if (user) {
      await fetchProfile();
    } else {
      setProfileState({ plays: 0 });
    }
  });

  const firebaseState = reactive({
    isSaving: false,
  });

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const checkOnline = (feature: string) => {
    const online = useOnline();
    if (!online.value) {
      console.warn(i18n.global.t('offlineMode', { feature }), 'error');
      return;
    }
  };

  const authenticateAnonymously = async () => {
    checkOnline('auth');
    const { fetchProfile } = useProfile();

    signInAnonymously(auth)
      .then(async (result) => {
        let userName = result.user.displayName ?? 'Trainer';
        setName(userName);

        // Fetch and load profile from Firebase
        await fetchProfile();

        showUserMessage(i18n.global.t('welcomeBack', { name: userName }));
      })
      .catch((error) => {
        console.error('Auth failed:', error);
        const errorMessage = error.message;
        showUserMessage(errorMessage, 'error');
      });
  };

  const createRecord = async () => {
    checkOnline('saveLeaderboard');

    const { flowState } = useGameFlow();
    const pokemonStore = usePokemons();
    const { numFound, numShadows } = storeToRefs(pokemonStore);
    const { timerState } = useTimer();
    const { getSavedState } = useSavedData();

    const user = auth.currentUser;
    if (!flowState.sessionId) {
      console.warn('No session ID, skipping');
      return;
    }

    try {
      const previousSession = await getDoc(doc(db, 'leaderboards', flowState.sessionId!));
      if (previousSession.exists()) {
        console.warn('Previous session exists, skipping');
        return;
      }

      const savedState = getSavedState();
      const payload: UserRecord = {
        ...savedState,
        hasGivenUp: flowState.isGivenUp,
        name: user?.displayName ?? savedState.name ?? 'Unknown Trainer',
        numFound: numFound.value,
        numShadows: numShadows.value,
        time: timerState.elapsed,
        uid: user ? user.uid : null,
      };

      await setDoc(doc(db, 'leaderboards', flowState.sessionId), payload);
    } catch (error) {
      console.error('Failed to save leaderboard record:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showUserMessage(i18n.global.t('leaderboardSaveFailed', { error: errorMessage }), 'error');
    }
  };

  const saveUserState = async (data: SaveData) => {
    checkOnline('saveUserState');

    const user = auth.currentUser;
    if (!user) return;

    firebaseState.isSaving = true;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      firebaseState.isSaving = false;
      saveTimeout = null;
    }, 3000);

    try {
      await setDoc(doc(db, 'users', user.uid), data);
    } catch (error) {
      firebaseState.isSaving = false;
      showErrorMessage(error, 'Failed to save user state');
    }
  };

  const deleteUserState = async () => {
    checkOnline('deleteUserState');

    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
    } catch (error) {
      showErrorMessage(error, 'Failed to delete user state');
    }
  };

  const loadUserState = async () => {
    checkOnline('loadUserState');

    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      showErrorMessage(error, 'Failed to load user state');
    }
    return null;
  };

  const prepareTopTrainersQuery = ({ uid, mode, gameMode, gen, type, limit: queryLimit }: TopTrainersOptions) => {
    checkOnline('getTopTrainersAsync');

    const andCondition = [where('hasGivenUp', '==', false)];
    if (uid) {
      andCondition.push(where('uid', '==', uid));
    }

    if (mode) {
      andCondition.push(where('mode', '==', mode));
    }

    if (gameMode) {
      andCondition.push(where('gameMode', '==', gameMode));

      if (gameMode === 'gen' && gen) {
        andCondition.push(where('gens', 'array-contains', gen));
      } else if (gameMode === 'types' && type) {
        andCondition.push(where('currentTypes', 'array-contains', type));
      }
    }

    return query(collection(db, 'leaderboards'), ...andCondition, orderBy('time', 'asc'), limit(queryLimit ?? 0));
  };

  const getTopTrainers = ({ gameMode, gen, limit: queryLimit = 3, mode, type, uid }: TopTrainersOptions = {}) => {
    const leaderBoardQuery = prepareTopTrainersQuery({
      gameMode: gameMode,
      gen: gen,
      limit: queryLimit,
      mode: mode,
      type: type,
      uid: uid,
    });

    return useFirestore<TopTrainer>(leaderBoardQuery as Query<TopTrainer>, undefined, {
      autoDispose: false,
      errorHandler: (error) => showErrorMessage(error, 'Firestore error'),
    });
  };

  const getTopTrainersAsync = async ({ gameMode, gen, limit = 3, mode, type, uid }: TopTrainersOptions = {}) => {
    const leaderBoardQuery = prepareTopTrainersQuery({
      gameMode: gameMode,
      gen: gen,
      limit: limit,
      mode: mode,
      type: type,
      uid: uid,
    });

    try {
      const snapshot = await getDocs(leaderBoardQuery);
      return snapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          }) as TopTrainer,
      );
    } catch (error) {
      showErrorMessage(error, 'Firestore error');
      throw error;
    }
  };

  const signout = async () => {
    checkOnline('signout');

    const { resetFlowState } = useGameFlow();

    try {
      await signOut(auth);
      setName(null);
      setAvatar(null);
      resetFlowState();
      showUserMessage(i18n.global.t('signedOut'));
    } catch (error) {
      console.error('Sign out failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showUserMessage(errorMessage, 'error');
    }
  };

  return {
    auth,
    authenticateAnonymously,
    authenticateWithFacebook,
    authenticateWithGithub,
    authenticateWithGoogle,
    authenticateWithX,
    createRecord,
    deleteUserState,
    firebaseState,
    getTopTrainers,
    getTopTrainersAsync,
    loadUserState,
    saveUserState,
    signout,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFirebase, import.meta.hot));
}
