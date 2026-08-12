import { useFirebase } from '@/composables/useFirebase.ts';
import type { LeaderboardsProps } from '@/types.ts';

export const useLeaderboards = () => {
  const { getTopTrainers, getTopTrainersAsync } = useFirebase();

  const getLeaderboards = (props: LeaderboardsProps) => {
    const { gameMode, gen, limit, mode, type, uid } = props;

    return getTopTrainers({
      gameMode,
      gen,
      limit,
      mode,
      type,
      uid,
    });
  };

  const getLeaderboardsAsync = async (props: LeaderboardsProps) => {
    const { gameMode, gen, limit, mode, type, uid } = props;

    return getTopTrainersAsync({
      gameMode,
      gen,
      limit,
      mode,
      type,
      uid,
    });
  };

  return {
    getLeaderboards,
    getLeaderboardsAsync,
  };
};
