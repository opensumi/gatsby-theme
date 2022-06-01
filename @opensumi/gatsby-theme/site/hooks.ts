import { useEffect, useState } from 'react';
import { NavigatorBannerProps } from './components/NavigatorBanner';

export const usePrevAndNext = (): NavigatorBannerProps['post'][] => {
  const [prevAndNext, setPrevAndNext] = useState<
    NavigatorBannerProps['post'][]
  >([]);
  useEffect(() => {
    const menuNodes = document.querySelectorAll('aside .ant-menu-item a');
    const currentMenuNode = document.querySelector(
      'aside .ant-menu-item-selected a',
    );
    const currentIndex = Array.from(menuNodes).findIndex(
      (node) => node === currentMenuNode,
    );
    const prevNode =
      currentIndex - 1 >= 0 ? menuNodes[currentIndex - 1] : undefined;
    const nextNode =
      currentIndex + 1 < menuNodes.length
        ? menuNodes[currentIndex + 1]
        : undefined;
    const prev = prevNode
      ? {
          slug: prevNode.getAttribute('href') || undefined,
          title: prevNode.textContent || undefined,
        }
      : undefined;
    const next = nextNode
      ? {
          slug: nextNode.getAttribute('href') || undefined,
          title: nextNode.textContent || undefined,
        }
      : undefined;
    setPrevAndNext([prev, next]);
  }, []);
  return prevAndNext;
};

export const useLogoLink = ({
  link = '',
  siteUrl = '',
  lang = '',
}: {
  link?: string;
  siteUrl?: string;
  lang?: string;
}): [string] => {
  let defaultLogoLink;
  if (link) {
    defaultLogoLink = link;
  } else if (siteUrl === 'https://opensumi.com') {
    defaultLogoLink = `/${lang}`;
  } else {
    defaultLogoLink = `https://opensumi.com/${lang}`;
  }

  return [defaultLogoLink];
};
