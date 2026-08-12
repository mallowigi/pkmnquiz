import { useFirebase } from '@/composables/useFirebase.ts';
import type { LeaderboardsProps } from '@/types.ts';

export const useLeaderboards = () => {
  const { getTopTrainers, getTopTrainersAsync } = useFirebase();

  const getLeaderboards = (props: LeaderboardsProps) => {
    const { gameMode, gens, limit, mode, types, uid } = props;

    return getTopTrainers({
      gameMode,
      gens,
      limit,
      mode,
      types,
      uid,
    });
  };

  const getLeaderboardsAsync = async (props: LeaderboardsProps) => {
    const { gameMode, gens, limit, mode, types, uid } = props;

    return getTopTrainersAsync({
      gameMode,
      gens,
      limit,
      mode,
      types,
      uid,
    });
  };

  return {
    getLeaderboards,
    getLeaderboardsAsync,
  };
};
