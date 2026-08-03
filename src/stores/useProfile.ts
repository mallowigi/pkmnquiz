import { doc, getDoc, setDoc } from 'firebase/firestore';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { auth, db } from '@/firebase.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useState } from '@/stores/useState.ts';
import type { FinishedGames, Profile } from '@/types';

const initializeFinishedGames = (): FinishedGames => ({
  chaos: 0,
  full: 0,
  gen: {
    gen1: 0,
    gen2: 0,
    gen3: 0,
    gen4: 0,
    gen5: 0,
    gen6: 0,
    gen7: 0,
    gen8: 0,
    gen9: 0,
  },
  mega: 0,
  noCries: 0,
  noShadows: 0,
  normal: 0,
  order: 0,
  special: 0,
  types: {
    bug: 0,
    dark: 0,
    dragon: 0,
    electric: 0,
    fairy: 0,
    fighting: 0,
    fire: 0,
    flying: 0,
    ghost: 0,
    grass: 0,
    ground: 0,
    ice: 0,
    normal: 0,
    poison: 0,
    psychic: 0,
    rock: 0,
    steel: 0,
    water: 0,
  },
});

export const useProfile = defineStore('profile', () => {
  const profileState = reactive<Profile>({
    finishedGames: initializeFinishedGames(),
    plays: 0,
  });

  const { showErrorMessage } = useMessages();

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfileState(docSnap.data() as Profile);
      }
    } catch (error) {
      showErrorMessage(error, 'Failed to fetch profile');
    }
  };

  const saveUserProfile = async (stats: Partial<Profile>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(doc(db, 'profiles', user.uid), stats, { merge: true });
    } catch (error) {
      showErrorMessage(error, 'Failed to save profile');
    }
  };

  const incrementPlays = () => {
    profileState.plays += 1;
    saveUserProfile({ plays: profileState.plays });
  };

  const setProfileState = (profile: Partial<Profile>) => {
    Object.assign(profileState, profile);
  };

  const updateFinishedGames = () => {
    const { state } = useState();
    const { getCurrentGens } = useCurrentGen();
    const { getCurrentTypes } = useCurrentType();

    const { gameMode, withShadows, withCriesShuffle, mode } = state;

    if (!gameMode) return;

    // Keep order track
    switch (mode) {
      case 'chaos':
        profileState.finishedGames.chaos += 1;
        break;
      case 'normal':
        profileState.finishedGames.normal += 1;
        break;
      case 'order':
        profileState.finishedGames.order += 1;
        break;
      default:
        break;
    }

    // Increment finished games based on game mode and current state
    if (gameMode === 'full') {
      profileState.finishedGames.full += 1;
    } else if (gameMode === 'gen') {
      const gens = getCurrentGens();

      gens?.forEach((genInfo) => {
        profileState.finishedGames.gen[genInfo.id] += 1;
      });
    } else if (gameMode === 'types' && getCurrentTypes()) {
      const types = getCurrentTypes();

      types?.forEach((typeInfo) => {
        profileState.finishedGames.types[typeInfo.id] += 1;
      });
    } else if (gameMode === 'special') {
      profileState.finishedGames.special += 1;
    } else if (gameMode === 'mega') {
      profileState.finishedGames.mega += 1;
    }

    // More stats if the game was finished without shadows or cries
    if (!withShadows) {
      profileState.finishedGames.noShadows += 1;
    }
    if (!withCriesShuffle) {
      profileState.finishedGames.noCries += 1;
    }

    // Save the updated finished games to the database
    saveUserProfile({ finishedGames: profileState.finishedGames });
  };

  return {
    fetchProfile,
    incrementPlays,
    initializeFinishedGames,
    profileState,
    saveUserProfile,
    setProfileState,
    updateFinishedGames,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfile, import.meta.hot));
}
