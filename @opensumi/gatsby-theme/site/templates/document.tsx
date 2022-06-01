import React, { useState, useCallback, useContext } from 'react';
import { graphql, Link } from 'gatsby';
import {
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  VerticalAlignTopOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import {
  Layout as AntLayout,
  Menu,
  Tooltip,
  Affix,
  Anchor,
  BackTop,
} from 'antd';
import { groupBy, debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Drawer from 'rc-drawer';
import { useMedia } from 'react-use';
import RehypeReact from 'rehype-react';
import { LayoutContext } from '../layouts/layout-context';
import Swatch from '../components/Swatch';
import Article from '../components/Article';
import NavigatorBanner from '../components/NavigatorBanner';
import SEO from '../components/Seo';
import CustomTag from '../components/CustomTag';
import { usePrevAndNext } from '../hooks';
import { capitalize } from '../utils';
import * as styles from './markdown.module.less';

const { Link: AnchorLink } = Anchor;

enum AnchorLinkStatus {
  NONE = 'none',
  EXPAND = 'expand',
  FLOD = 'flod',
}
interface AnchorLinkAttr {
  href: string;
  title: string;
  children: any;
  status: AnchorLinkStatus;
}

const shouldBeShown = (slug: string, path: string, lang: string) => {
  if (!slug.startsWith(`/${lang}/`)) {
    return false;
  }
  const slugPieces = slug.split('/').slice(slug.split('/').indexOf('docs') + 1);
  const pathPieces = path.split('/').slice(slug.split('/').indexOf('docs') + 1);
  return slugPieces[0] === pathPieces[0];
};

const getMenuItemLocaleKey = (slug = '') => {
  const slugPieces = slug.split('/');
  const menuItemLocaleKey = slugPieces
    .slice(slugPieces.indexOf('docs') + 1)
    .filter((key) => key)
    .join('/');
  return menuItemLocaleKey;
};

const getDocument = (docs: any[], slug = '', level: number) => {
  if (slug.split('/').length !== level + 2) {
    return;
  }
  return docs.find((doc) => doc.slug === slug);
};

const getAnchorLinks = (tableOfContents: string) => {
  // https://github.com/gatsbyjs/gatsby/issues/19487
  // Deploying to netlify : error "document" is not available during server side rendering
  if (typeof window === 'undefined' || !window.document) {
    return [];
  }
  const temp = document.createElement('div');
  temp.innerHTML = tableOfContents;
  const nodes = temp.childNodes;

  const parseUl = (node: HTMLElement) => {
    if (!node) {
      return [];
    }
    const items = node.childNodes;
    const result = [];

    for (let i = 0, len = items.length; i < len; i += 1) {
      const item = items[i] as HTMLElement;
      if (item.tagName === 'LI') {
        const link: any = {};
        const childs = item.childNodes as NodeListOf<HTMLElement>;
        childs.forEach((child: HTMLElement) => {
          if (child.tagName === 'A') {
            link.href = decodeURIComponent((child as HTMLAnchorElement).hash);
            link.title = child.innerText;
          } else if (child.tagName === 'P') {
            link.href = decodeURIComponent(
              (child.childNodes[0] as HTMLAnchorElement).hash,
            );
            link.title = (child.childNodes[0] as HTMLElement).innerText;
          } else if (child.tagName === 'UL') {
            link.children = parseUl(child);
          }
        });
        link.status = link.children
          ? AnchorLinkStatus.EXPAND
          : AnchorLinkStatus.NONE;
        result.push(link);
      }
    }

    return result;
  };
  return parseUl(nodes[0] as HTMLElement);
};

interface MenuData {
  type: 'SubMenu' | 'Item';
  title: string;
  slug: string;
  order?: number;
  children?: MenuData[];
}

const getMenuData = ({ groupedEdges, language, docs = [], level = 0 }: any) => {
  const results = [] as MenuData[];
  Object.keys(groupedEdges).forEach((key: string) => {
    const edges = groupedEdges[key] || [];
    const categoryKey = getMenuItemLocaleKey(key);
    const category = getDocument(docs, categoryKey, level);
    if (!category) {
      if (categoryKey.split('/').length !== level + 1) {
        return;
      }
      edges.forEach((edge: any) => {
        const {
          node: {
            frontmatter: { title, order },
            fields: { slug },
          },
        } = edge;
        results.push({
          type: 'Item',
          slug,
          title,
          order,
        });
      });
    } else {
      const subGroupedEdges = {} as any;
      Object.keys(groupedEdges).forEach((item: string) => {
        if (item.startsWith(key)) {
          subGroupedEdges[item] = groupedEdges[item];
        }
      });
      results.push({
        type: 'SubMenu',
        title:
          category.title && category.title[language]
            ? category.title[language]
            : categoryKey,
        slug: key,
        order: category.order || 0,
        children: getMenuData({
          groupedEdges: subGroupedEdges,
          language,
          docs,
          level: level + 1,
        }),
      });
    }
  });
  return results.sort((a: any, b: any) => a.order - b.order);
};

const renderMenu = (menuData: MenuData[]) =>
  menuData.map((item: MenuData) => {
    if (item.type === 'Item') {
      return (
        <Menu.Item key={item.slug}>
          <Link to={item.slug}>{item.title}</Link>
        </Menu.Item>
      );
    }
    if (item.type === 'SubMenu') {
      return (
        item.children &&
        item.children.length > 0 && (
          <Menu.SubMenu key={item.slug} title={capitalize(item.title)}>
            {renderMenu(item.children)}
          </Menu.SubMenu>
        )
      );
    }
    return null;
  });

export const getGithubSourceUrl = ({
  githubUrl,
  relativePath,
  prefix,
}: {
  githubUrl: string;
  relativePath: string;
  prefix: string;
}): string => {
  if (githubUrl.includes('/tree/main/')) {
    return `${githubUrl.replace(
      '/tree/main/',
      '/edit/main/',
    )}/${prefix}/${relativePath}`;
  }
  return `${githubUrl}/edit/main/${prefix}/${relativePath}`;
};

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  location,
}: {
  data: any;
  location: Location;
  pageContext: {
    examples: any;
  };
}): React.ReactNode {
  const [prev, next] = usePrevAndNext();
  const { markdownRemark, allMarkdownRemark, site } = data; // data.markdownRemark holds our post data
  if (!markdownRemark) {
    return null;
  }
  const {
    frontmatter,
    htmlAst,
    tableOfContents,
    fields: { slug },
    parent: { relativePath },
  } = markdownRemark;
  const { edges = [] } = allMarkdownRemark;
  const edgesInDocs = edges.filter((item: any) =>
    item.node.fields.slug.includes('/docs/'),
  );
  const {
    siteMetadata: { docs = [], githubUrl, docsUrl = '' },
    pathPrefix,
  } = site;
  const pathWithoutPrefix = location.pathname.replace(
    new RegExp(`^${pathPrefix}`),
    '',
  );
  const { t, i18n } = useTranslation();
  const groupedEdges = groupBy(
    edgesInDocs,
    ({
      node: {
        fields: { slug: slugString },
      },
    }: any) => slugString.split('/').slice(0, -1).join('/'),
  );

  const filterGroupedEdges = {} as any;
  Object.keys(groupedEdges)
    .filter((key) => shouldBeShown(key, pathWithoutPrefix, i18n.language))
    .forEach((key: string) => {
      filterGroupedEdges[key] = groupedEdges[key];
    });

  const [openKeys, setOpenKeys] = useState<string[]>(
    Object.keys(filterGroupedEdges),
  );

  const menuData = getMenuData({
    groupedEdges: filterGroupedEdges,
    language: i18n.language,
    docs,
  });

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[slug]}
      style={{ height: '100%' }}
      openKeys={openKeys}
      onOpenChange={(currentOpenKeys) =>
        setOpenKeys(currentOpenKeys as string[])
      }
      inlineIndent={24}
      forceSubMenuRender
    >
      {renderMenu(menuData)}
    </Menu>
  );

  const isWide = useMedia('(min-width: 767.99px)', true);
  const [drawOpen, setDrawOpen] = useState(false);
  const { collapsed, setCollapsed } = useContext(LayoutContext);

  const collapseSlider = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);
  const menuSider = (
    <Affix
      offsetTop={0}
      className={styles.affix}
      style={{ height: isWide ? '100vh' : 'inherit' }}
    >
      {isWide ? (
        <div className={styles.menuWrapper}>
          <div
            className={classNames(
              styles.collapsedButton,
              collapsed && styles.collapsed,
            )}
            onClick={collapseSlider}
          >
            <svg
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2611"
              width="128"
              height="128"
            >
              <path
                d="M341.333333 298.666667H213.333333v469.333333h640V298.666667H384v469.333333H341.333333V298.666667z m554.666667-42.666667v554.666667H170.666667V256h725.333333z"
                p-id="2612"
              />
            </svg>
          </div>
          <AntLayout.Sider
            width="auto"
            theme="light"
            className={classNames(styles.sider, collapsed && styles.collapsed)}
          >
            {menu}
          </AntLayout.Sider>
        </div>
      ) : (
        <Drawer
          handler={
            drawOpen ? (
              <MenuFoldOutlined className={styles.menuSwitch} />
            ) : (
              <MenuUnfoldOutlined className={styles.menuSwitch} />
            )
          }
          wrapperClassName={styles.menuDrawer}
          onChange={(open) => setDrawOpen(!!open)}
          width={280}
        >
          {menu}
        </Drawer>
      )}
    </Affix>
  );

  const renderAst = new RehypeReact({
    createElement: React.createElement,
    components: {
      swatch: Swatch,
      tag: CustomTag,
    },
  }).Compiler;

  const [anchorLinks, setAnchorLinks] = useState(() =>
    getAnchorLinks(tableOfContents),
  );

  const changeAnchorLinkStatus = (link: AnchorLinkAttr) => {
    const tLink = link;
    const { status } = link;
    const nextStatus =
      status === AnchorLinkStatus.EXPAND
        ? AnchorLinkStatus.FLOD
        : AnchorLinkStatus.EXPAND;
    tLink.status = nextStatus;
    setAnchorLinks([...anchorLinks]);
  };

  const renderAnchorLinks = (links: AnchorLinkAttr[], showChildren = true) =>
    links.map((link: AnchorLinkAttr) => (
      <React.Fragment key={link.href}>
        {link.status === AnchorLinkStatus.EXPAND && (
          <CaretDownOutlined
            style={{ color: '#8c8c8c' }}
            onClick={() => changeAnchorLinkStatus(link)}
          />
        )}
        {link.status === AnchorLinkStatus.FLOD && (
          <CaretRightOutlined
            style={{ color: '#8c8c8c' }}
            onClick={() => changeAnchorLinkStatus(link)}
          />
        )}
        <AnchorLink
          href={link.href}
          title={link.title}
          className={link.children ? styles.parent : styles.children}
        >
          {link.children &&
            link.status === AnchorLinkStatus.EXPAND &&
            showChildren &&
            renderAnchorLinks(link.children, false)}
        </AnchorLink>
      </React.Fragment>
    ));

  const onAnchorLinkChange = debounce((currentActiveLink: string) => {
    if (currentActiveLink) {
      const link = document.querySelector(`a[href='${currentActiveLink}']`);
      if (link) {
        const anchor = link?.parentNode as Element;
        anchor.scrollIntoView({
          block: 'center',
        });
      }
    }
  }, 300);

  return (
    <>
      <SEO title={frontmatter.title} lang={i18n.language} />
      <AntLayout
        style={{ background: '#fff' }}
        hasSider
        className={styles.layout}
      >
        {menuSider}
        <Article
          className={classNames(styles.markdown, collapsed && styles.collapsed)}
        >
          <Affix offsetTop={8}>
            <div className={styles.toc}>
              <Anchor
                className={styles.apiAnchor}
                onChange={onAnchorLinkChange}
              >
                {renderAnchorLinks(anchorLinks)}
              </Anchor>
            </div>
          </Affix>
          <div
            className={classNames(styles.main, collapsed && styles.collapsed)}
          >
            <h1>
              {frontmatter.title}
              <Tooltip title={t('在 GitHub 上编辑')}>
                <a
                  href={getGithubSourceUrl({
                    githubUrl: docsUrl || githubUrl,
                    relativePath,
                    prefix: 'docs',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.editOnGtiHubButton}
                >
                  <EditOutlined />
                </a>
              </Tooltip>
            </h1>
            <div className={styles.content}>{renderAst(htmlAst)}</div>
            <div>
              <NavigatorBanner type="prev" post={prev} />
              <NavigatorBanner type="next" post={next} />
              <BackTop style={{ right: 32 }}>
                <div className={styles.backTop}>
                  <VerticalAlignTopOutlined />
                </div>
              </BackTop>
            </div>
          </div>
        </Article>
      </AntLayout>
    </>
  );
}

export const pageQuery = graphql`
  query ($path: String!) {
    site {
      siteMetadata {
        title
        githubUrl
        docsUrl
        docs {
          slug
          title {
            zh
            en
          }
          order
        }
      }
      pathPrefix
    }
    markdownRemark(fields: { slug: { eq: $path } }) {
      htmlAst
      tableOfContents
      fields {
        slug
      }
      frontmatter {
        title
      }
      parent {
        ... on File {
          relativePath
        }
      }
    }
    allMarkdownRemark(
      filter: { fields: { slug: { regex: "//docs//" } } }
      sort: { order: ASC, fields: [frontmatter___order] }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            order
          }
        }
      }
    }
  }
`;
