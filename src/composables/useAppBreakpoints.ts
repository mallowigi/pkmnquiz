import { useBreakpoints } from '@vueuse/core';
import { computed } from 'vue';

const breakpoints = useBreakpoints(
  {
    desktop: 1320,
    laptop: 1024,
    mobile: 640,
    tablet: 768,
  },
  {
    strategy: 'max-width',
  },
);

export const useAppBreakpoints = () => {
  const isMobile = computed(() => {
    return breakpoints.mobile.value;
  });

  const isTablet = computed(() => {
    return breakpoints.tablet.value;
  });

  const isLaptop = computed(() => {
    return breakpoints.laptop.value;
  });

  const isDesktop = computed(() => {
    return breakpoints.desktop.value;
  });

  return {
    breakpoints,
    isDesktop,
    isLaptop,
    isMobile,
    isTablet,
  };
};
