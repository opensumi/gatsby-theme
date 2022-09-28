import React, { useEffect } from 'react';
import { useStaticQuery, graphql, withPrefix, Link } from 'gatsby';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getCurrentLangKey } from 'ptz-i18n';
import { Helmet } from 'react-helmet';
import { FooterProps } from 'rc-footer';
import { useLocalStorage } from 'react-use';
import Seo from '../components/Seo';
import Header from '../components/Header';
import PageLoading from '../components/PageLoading';
import Footer from '../components/Footer';
import CopyRightFooter from '../components/CopyRight';
import TopBanner from '../components/TopBanner';
import { LayoutContext } from './layout-context';
import * as styles from './layout.module.less';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    initImmediate: false,
    fallbackLng: 'zh',
    keySeparator: false,
    react: {
      useSuspense: false,
    },
  });

const lngs = ['zh', 'en'];

interface LayoutProps {
  children: React.ReactElement<any>;
  location: Location;
  pageContext: any;
  footerProps: FooterProps;
  showCopyRight: boolean;
}

function parseNulltoUndefined<T>(value: T) {
  if (value === null) {
    return undefined;
  }
  return value;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  location,
  footerProps,
  showCopyRight,
}) => {
  // https://github.com/gatsbyjs/gatsby/issues/13867#issuecomment-489481343
  if (location.pathname.includes('offline-plugin-app-shell-fallback')) {
    return <PageLoading />;
  }
  const query = graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          githubUrl
          siteUrl
          logoUrl
          showSearch
          isOpenSumiSite
          showLanguageSwitcher
          showGithubStar
          showGithubCorner
          showDingTalkQRCode
          dingTalkQRCode
          navs {
            slug
            title {
              zh
              en
            }
            target
          }
          redirects {
            from
            to
          }
          docsearchOptions {
            apiKey
            indexName
            appId
          }
          ecosystems {
            name {
              zh
              en
            }
            url
          }
          announcement {
            zh
            en
          }
        }
      }
      locales {
        internal {
          content
        }
      }
    }
  `;
  const { site, locales } = useStaticQuery(query);
  const [collapsed, setCollapsed] = useLocalStorage('siderCollapsed', false);

  const {
    siteMetadata: {
      title,
      navs = [],
      githubUrl,
      siteUrl,
      logoUrl = '',
      showLanguageSwitcher,
      showSearch,
      isOpenSumiSite,
      showGithubStar,
      showGithubCorner,
      showDingTalkQRCode,
      dingTalkQRCode,
      redirects = [],
      docsearchOptions,
      ecosystems,
      announcement,
    },
  } = site;

  let resources = {};
  try {
    resources = JSON.parse(locales.internal.content);
  } catch (e) {
    // empty
  }
  const pathPrefix = withPrefix('/').replace(/\/$/, '');
  const path = location.pathname.replace(pathPrefix, '');
  const currentLangKey = getCurrentLangKey(lngs, 'zh', path);

  const isHomePage =
    path === '/' ||
    path === `/${currentLangKey}` ||
    path === `/${currentLangKey}/`;

  if (!i18n.options.lng || process.env.NODE_ENV === 'production') {
    i18n.init({
      lng: currentLangKey,
    });
  }

  if (!i18n.options.resources) {
    i18n.init({
      resources,
    });
  }

  useEffect(() => {
    if (i18n.language !== currentLangKey) {
      i18n.changeLanguage(currentLangKey);
    }
  }, [currentLangKey]);

  if (
    location.pathname === pathPrefix ||
    (children && children.type && (children as any).type.noLayout)
  ) {
    return children;
  }

  const getRediectUrl = () => {
    const list = redirects || [];
    for (let i = 0; i < list.length; i += 1) {
      const {
        from = '',
        to,
        keepUrl,
      } = list[i] as {
        from: string | RegExp;
        to: string;
        keepUrl?: boolean;
      };
      // 支持字符串和正则表达式比较
      if (
        location.pathname !== from &&
        !new RegExp(from).test(location.pathname)
      ) {
        return;
      }
      if (keepUrl && new RegExp(from).test(location.pathname)) {
        return location.pathname.replace(new RegExp(from), to);
      }
      return to;
    }
  };

  const rediectUrl = getRediectUrl();
  const logoProps = logoUrl
    ? {
        logo: {
          img: <img src={logoUrl} alt={title} />,
        },
        link: siteUrl,
      }
    : {};

  const isExamplePage =
    location.pathname.includes('/examples/') &&
    !location.pathname.endsWith('/gallery');

  return (
    <LayoutContext.Provider
      value={{
        collapsed: !!collapsed,
        setCollapsed: (value: boolean) => setCollapsed(value),
      }}
    >
      {rediectUrl && (
        <Helmet>
          <meta httpEquiv="refresh" content={`0;url=${rediectUrl}`} />
        </Helmet>
      )}
      <Seo title={title} lang={i18n.language} />
      <Header
        subTitle={title}
        path={path}
        pathPrefix={pathPrefix}
        navs={navs}
        siteUrl={siteUrl}
        githubUrl={githubUrl}
        Link={Link}
        transparent={isHomePage}
        isHomePage={isHomePage}
        isOpenSumiSite={isOpenSumiSite}
        showSearch={parseNulltoUndefined(showSearch)}
        showGithubStar={parseNulltoUndefined(showGithubStar)}
        showGithubCorner={parseNulltoUndefined(showGithubCorner)}
        showLanguageSwitcher={parseNulltoUndefined(showLanguageSwitcher)}
        showDingTalkQRCode={parseNulltoUndefined(showDingTalkQRCode)}
        dingTalkQRCode={parseNulltoUndefined(dingTalkQRCode)}
        docsearchOptions={docsearchOptions}
        ecosystems={ecosystems}
        {...logoProps}
      />
      {/* 首页和 example 演示页 不展示 头部 banner */}
      {!isHomePage && !isExamplePage && (
        <TopBanner announcement={announcement} />
      )}
      <main className={styles.main}>{children}</main>
      {!isExamplePage && (
        <Footer
          githubUrl={githubUrl}
          rootDomain="https://opensumi.com"
          location={location}
          {...footerProps}
        />
      )}
      {showCopyRight && <CopyRightFooter location={location} />}
    </LayoutContext.Provider>
  );
};

export default Layout;
