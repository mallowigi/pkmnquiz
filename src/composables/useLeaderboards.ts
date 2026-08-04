import { useFirebase } from '@/composables/useFirebase.ts';
import type { GameMode, Gen, Mode, Type } from '@/types.ts';

type LeaderboardsProps = {
  gameMode?: GameMode | null;
  gen?: Gen | null;
  limit?: number;
  mode?: Mode | null;
  type?: Type | null;
  uid?: string | null;
};

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
