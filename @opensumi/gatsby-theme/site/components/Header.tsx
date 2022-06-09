/* eslint jsx-a11y/anchor-is-valid: 0 */
import { navigate } from 'gatsby';
import React, { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  CheckOutlined,
  GithubOutlined,
  MenuOutlined,
  DownOutlined,
  DingtalkOutlined,
} from '@ant-design/icons';
import { Popover, Menu, Select, Dropdown, message } from 'antd';
import { map } from 'lodash-es';
import GitHubButton from 'react-github-btn';
import Search, { SearchProps } from './Search';
import NavMenuItems, { Nav } from './NavMenuItems';
import ExternalLinkIcon from './ExternalLinkIcon';
import { useLogoLink } from '../hooks';
import TranslationIcon from '../images/translation.svg';
import * as styles from './Header.module.less';

interface HeaderProps {
  pathPrefix?: string;
  path?: string;
  /** 子标题 */
  subTitle?: React.ReactNode;
  /** 子标题的链接 */
  subTitleHref?: string;
  /** 文档和演示的菜单数据 */
  navs?: Nav[];
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否显示 Github 图标 */
  showGithubCorner?: boolean;
  /** 是否显示 Github Star */
  showGithubStar?: boolean;
  /** 是否显示切换语言选项 */
  showLanguageSwitcher?: boolean;
  /** 切换语言的回调 */
  onLanguageChange?: (language: string) => void;
  /** 是否二维码 */
  showDingTalkQRCode?: boolean;
  /** 二维码图表地址 */
  dingTalkQRCode?: string;
  /** 自定义 logo */
  logo?: {
    img?: React.ReactNode;
    link?: string;
  };
  siteUrl?: string;
  /** github 仓库地址 */
  githubUrl?: string;
  /** 默认语言 */
  defaultLanguage?: 'zh' | 'en';
  /** 自定义 Link */
  Link?: React.ComponentType<any>;
  /** 底色是否透明 */
  transparent?: boolean;
  /** 是否首页模式 */
  isHomePage?: boolean;
  /** 是否是OpenSumi官网 */
  isOpenSumiSite?: boolean;
  /** OpenSumi root 域名，直接用主题的可不传 */
  rootDomain?: string;
  /** 是否展示国内镜像链接 */
  /** algolia 搜索配置 */
  docsearchOptions?: SearchProps['docsearchOptions'];
  /** 展示周边生态 */
  ecosystems?: Array<{
    name: Record<string /** zh, en */, string>;
    url: string;
  }>;
}

export const parseGithubUrl = (githubUrl: string) => {
  const uri = new URL(githubUrl);
  const toString = (protocol: string) => {
    uri.protocol = protocol;
    return uri.toString();
  };
  return {
    name: uri.pathname.split('/')[2],
    full_name: uri.pathname.slice(1),
    toString,
  };
};

const Header: React.FC<HeaderProps> = ({
  subTitle = '',
  subTitleHref,
  pathPrefix = '',
  path = '',
  navs = [],
  showSearch = true,
  showGithubStar = false,
  showGithubCorner = true,
  showLanguageSwitcher = true,
  logo,
  onLanguageChange,
  // 默认就使用 OpenSumi 的公众号
  showDingTalkQRCode = true,
  dingTalkQRCode = 'https://img.alicdn.com/imgextra/i1/O1CN01k3gCmL1HWPjLchVv7_!!6000000000765-0-tps-200-199.jpg',
  siteUrl,
  githubUrl = 'https://github.com/opensumi/core',
  defaultLanguage,
  Link = 'a',
  transparent,
  isHomePage,
  isOpenSumiSite = false,
  docsearchOptions,
  ecosystems,
}) => {
  const { t, i18n } = useTranslation();
  const isOpenSumiHome = isOpenSumiSite && isHomePage; // 是否为OpenSumi官网首页
  const lang =
    typeof defaultLanguage !== 'undefined'
      ? defaultLanguage
      : i18n.language || '';
  const SubTitleLink = (subTitleHref || '').startsWith('http') ? 'a' : Link;
  const [productMenuVisible, setProductMenuVisible] = useState(false);

  const [popupMenuVisible, setPopupMenuVisible] = useState(false);
  const onTogglePopupMenuVisible = () => {
    setPopupMenuVisible(!popupMenuVisible);
  };

  const { img, link } = {
    link: '',
    ...logo,
  };

  useEffect(() => {
    if (popupMenuVisible) {
      setPopupMenuVisible(false);
    }
  }, [path]);

  // 移动端下弹出菜单时，禁止页面滚动
  useEffect(() => {
    if (popupMenuVisible) {
      document.documentElement!.style.overflow = 'hidden';
    } else {
      document.documentElement!.style.overflow = '';
    }
    return () => {
      document.documentElement!.style.overflow = '';
    };
  }, [popupMenuVisible]);

  const isWide = useMedia('(min-width: 767.99px)', true);
  const menuIcon = !isWide ? (
    <MenuOutlined
      className={styles.menuIcon}
      onClick={onTogglePopupMenuVisible}
    />
  ) : null;

  const [logoLink] = useLogoLink({
    siteUrl,
    lang,
    link,
  });

  const menu = (
    <ul
      className={classNames(styles.menu, {
        [styles.popup]: !isWide,
        [styles.popupHidden]: !popupMenuVisible,
      })}
    >
      {navs && navs.length ? <NavMenuItems navs={navs} path={path} /> : null}

      {ecosystems && ecosystems.length ? (
        <li>
          <Dropdown
            className={styles.ecoSystems}
            overlay={
              <Menu>
                {map(ecosystems, ({ url, name: ecosystemName }) => (
                  <Menu.Item key={ecosystemName?.[lang]}>
                    <a target="_blank" rel="noreferrer" href={url}>
                      {ecosystemName?.[lang]} <ExternalLinkIcon />
                    </a>
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <span>
              {t('周边生态 TEST')}
              <DownOutlined style={{ marginLeft: '6px' }} />
            </span>
          </Dropdown>
        </li>
      ) : null}

      {showLanguageSwitcher && (
        <li>
          <Dropdown
            overlay={
              <Menu
                defaultSelectedKeys={[lang]}
                selectable
                onSelect={({ key }) => {
                  if (key === lang) {
                    return;
                  }
                  if (onLanguageChange) {
                    onLanguageChange(key.toString());
                    return;
                  }
                  if (path.endsWith(`/${lang}`)) {
                    navigate(`/${key}`);
                    return;
                  }
                  navigate(
                    path
                      .replace(pathPrefix, '')
                      .replace(`/${lang}/`, `/${key}/`),
                  );
                }}
              >
                <Menu.Item key="en">
                  <CheckOutlined
                    style={{
                      visibility: lang === 'en' ? 'visible' : 'hidden',
                      color: '#52c41a',
                    }}
                  />
                  English
                </Menu.Item>
                <Menu.Item key="zh">
                  <CheckOutlined
                    style={{
                      visibility: lang === 'zh' ? 'visible' : 'hidden',
                      color: '#52c41a',
                    }}
                  />
                  简体中文
                </Menu.Item>
              </Menu>
            }
            className={styles.translation}
          >
            {/* <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <TranslationIcon className={styles.translation} />
              { lang === 'zh' ? '简体中文' : 'English' }
            </a> */}
            <span>
              <TranslationIcon />
              {lang === 'zh' ? '简体中文' : 'English'}
              <DownOutlined style={{ marginLeft: '6px' }} />
            </span>
          </Dropdown>
        </li>
      )}

      {showDingTalkQRCode && dingTalkQRCode && (
        <li className={styles.dingTalkQRCode}>
          <Popover
            content={
              <img
                width="100%"
                height="100%"
                src={dingTalkQRCode}
                alt="wx-qrcode"
              />
            }
            title={null}
            overlayClassName="wx-qrcode-popover"
            overlayStyle={{ width: 128, height: 128 }}
            overlayInnerStyle={{ padding: 2 }}
          >
            <DingtalkOutlined />
          </Popover>
        </li>
      )}

      {showGithubCorner && (
        <li className={styles.githubCorner}>
          <a
            href={parseGithubUrl(githubUrl).toString('https')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubOutlined />
          </a>
        </li>
      )}

      {showGithubStar && (
        <li className={styles.githubStar}>
          <span>
            <GitHubButton
              href={`https://github.com/${parseGithubUrl(githubUrl).full_name}`}
              data-size="large"
              data-show-count="true"
              aria-label={`Star ${
                parseGithubUrl(githubUrl).full_name
              } on GitHub`}
            >
              Star
            </GitHubButton>
          </span>
        </li>
      )}
    </ul>
  );

  return (
    <header
      className={classNames(styles.header, {
        [styles.transparent]: !!transparent && !productMenuVisible,
        [styles.isHomePage]: !!isHomePage && !isOpenSumiHome,
        [styles.lightTheme]: !!isOpenSumiHome && !productMenuVisible && isWide,
        [styles.fixed]: popupMenuVisible,
      })}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <h1>
            <a href={logoLink}>{img}</a>
          </h1>
          {subTitle && (
            <>
              <span className={styles.divider} />
              <h2 className={styles.subProduceName}>
                {React.createElement(
                  SubTitleLink,
                  {
                    [SubTitleLink === 'a' ? 'href' : 'to']:
                      typeof subTitleHref === 'undefined'
                        ? `/${lang}`
                        : subTitleHref,
                  },
                  subTitle,
                )}
              </h2>
            </>
          )}
        </div>
        <nav className={styles.nav}>
          {showSearch && (
            <Search docsearchOptions={docsearchOptions} lang={lang} />
          )}
          {menu}
          {menuIcon}
        </nav>
      </div>
    </header>
  );
};

export default Header;
