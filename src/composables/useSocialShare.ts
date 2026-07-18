import { useShare } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { useQuiz } from '@/composables/useQuiz.ts';
import { usePageTitle } from '@/composables/useTitle.ts';

type ShareProps = {
  numFound: number;
  elapsed: string;
};

/**
 * Composable for social sharing functionality.
 *
 * @param numFound The number of Pokémon found.
 * @param elapsed The time elapsed in string format.
 */
export const useSocialShare = () => {
  const { t } = useI18n();
  const { getGameModeName } = useQuiz();
  const { getTitle } = usePageTitle();
  const { share, isSupported } = useShare();

  const getShareText = ({ elapsed, numFound }: ShareProps) => {
    const regionOrType = getGameModeName();
    return t('endOverlay.summary2', {
      elapsed,
      numFound,
      regionOrType,
      url: window.location.href,
    });
  };

  const shareNative = (props: ShareProps) => {
    share({
      text: getShareText(props),
      title: getTitle().value ?? '',
      url: window.location.href,
    });
  };

  const shareX = (props: ShareProps) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(props))}`;
    window.open(url, '_blank');
  };

  const shareFacebook = (props: ShareProps) => {
    const text = getShareText(props);
    const appid = import.meta.env.VITE_FACEBOOK_APP_ID || '';
    const currentUrl = window.location.href;

    const url = appid
      ? `https://www.facebook.com/dialog/share?app_id=${appid}&display=popup&href=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(text)}&redirect_uri=${encodeURIComponent(currentUrl)}`
      : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  const shareBluesky = (props: ShareProps) => {
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(getShareText(props))}`;
    window.open(url, '_blank');
  };

  return {
    isSupported,
    shareBluesky,
    shareFacebook,
    shareNative,
    shareX,
  };
};
