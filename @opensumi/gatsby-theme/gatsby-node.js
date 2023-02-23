/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const webpack = require('webpack');
const { isEqual } = require('lodash/isEqual');
const { getSlugAndLang } = require('ptz-i18n');
const { transform } = require('@babel/standalone');

const documentTemplate = require.resolve(`./site/templates/document.tsx`);

function getLocaleResources() {
  let locale = {};
  try {
    locale = JSON.parse(
      fs.readFileSync(path.resolve(`site/locale.json`), `utf8`),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  const resources = {
    en: {
      translation: {
        ...locale,
        ...require('./site/common.json'), // eslint-disable-line global-require
      },
    },
  };

  return resources;
}

exports.onPluginInit = ({ store, reporter }) => {
  const { program } = store.getState();

  const dirs = [
    path.join(program.directory, 'docs'),
    path.join(program.directory, 'site'),
    path.join(program.directory, 'site', 'images'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      reporter.log(`creating the ${dir} directory`);
      mkdirp.sync(dir);
    }
  });
};

// Add custom url pathname for posts
exports.onCreateNode = ({
  node,
  actions,
  store,
  createNodeId,
  createContentDigest,
}) => {
  const { createNodeField, createNode } = actions;
  const { program } = store.getState();
  if (node.internal.type === `File`) {
    createNodeField({
      node,
    });
  } else if (node.internal.type === `MarkdownRemark`) {
    const { slug, langKey } = getSlugAndLang(
      {
        langKeyForNull: 'any',
        langKeyDefault: 'none',
        useLangKeyLayout: false,
        pagesPaths: [program.directory],
        prefixDefault: true,
      },
      node.fileAbsolutePath,
    );
    if (!slug) {
      return;
    }
    createNodeField({
      node,
      name: `slug`,
      value: (langKey === 'none' ? `/zh${slug}` : slug).replace(/\/$/, ''),
    });
    createNodeField({
      node,
      name: `langKey`,
      value: langKey,
    });
  }

  const resources = getLocaleResources();
  createNode({
    id: createNodeId(`locales`),
    parent: null,
    children: [],
    internal: {
      type: `Locales`,
      mediaType: `application/json`,
      content: JSON.stringify(resources || {}),
      contentDigest: createContentDigest(resources),
    },
  });
};

exports.createPages = async ({ actions, graphql, reporter, store }) => {
  const { createPage, deletePage } = actions;
  const result = await graphql(`
    {
      allMarkdownRemark(limit: 10000) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              order
            }
            html
          }
        }
      }
      allFile(limit: 10000) {
        nodes {
          relativePath
          absolutePath
        }
      }
      site {
        siteMetadata {
          docs {
            slug
            order
          }
          examples {
            slug
          }
          navs {
            slug
          }
        }
      }
    }
  `);
  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  const createdPages = [];

  const {
    site: { siteMetadata },
    allMarkdownRemark,
    allFile,
  } = result.data;

  const posts = allMarkdownRemark.edges.filter((item) => !!item);
  const allDemos = allFile.nodes
    .filter((node) => /demo\/(.*)\.[t|j]sx?$/.test(node.relativePath))
    .map((item) => {
      let meta;
      try {
        meta = JSON.parse(
          fs.readFileSync(
            path.join(path.dirname(item.absolutePath), 'meta.json'),
            'utf8',
          ) || '{}',
        );
      } catch (e) {
        meta = {};
      }
      const order = (meta.demos || []).findIndex(
        ({ filename }) => filename === path.basename(item.relativePath),
      );
      const demoInfo = (meta.demos || [])[order] || {};
      return {
        ...item,
        order: order || 0,
        filename: path.basename(item.relativePath),
        ...demoInfo,
      };
    });

  const allExamples = allDemos.map((item) => {
    const source = fs.readFileSync(item.absolutePath, 'utf8');
    const { code } = transform(source, {
      filename: item.absolutePath,
      presets: ['react', 'typescript', 'es2015', 'stage-3'],
      plugins: ['transform-modules-umd'],
      babelrc: false,
    });
    return {
      ...item,
      source,
      babeledSource: code,
    };
  });

  posts.forEach(({ node }) => {
    const { slug } = node.fields;
    const context = {};
    const isDocsPage =
      slug.startsWith(`/zh/docs`) || slug.startsWith(`/en/docs`);

    if (isDocsPage) {
      // 将 examples 传递给 document template
      context.examples = allExamples;
    }

    // 修复修改 example 代码不及时生效的问题
    const { pages } = store.getState();
    const oldPage = Array.from(pages)
      .map((item) => item[1])
      .find((p) => p.path === slug);
    if (oldPage && isEqual && !isEqual(oldPage.context, context)) {
      deletePage(oldPage);
    }

    createPage({
      path: slug, // required
      component: documentTemplate,
      context,
    });

    createdPages.push(slug);
  });

  const { navs = [] } = siteMetadata;
  navs.forEach(({ slug }) => {
    if (!slug.startsWith(`examples`) && !slug.startsWith(`docs`)) {
      return;
    }
    if (!createdPages.includes(`/zh/${slug}`)) {
      createPage({
        path: `/zh/${slug}`, // required
        component: documentTemplate,
      });
    }
    if (!createdPages.includes(`/en/${slug}`)) {
      createPage({
        path: `/en/${slug}`, // required
        component: documentTemplate,
      });
    }
  });
};

exports.onCreateWebpackConfig = ({ getConfig, stage }, { codeSplit }) => {
  const config = getConfig();
  if (stage.startsWith('develop') && config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 'react-dom': '@hot-loader/react-dom',
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      url: require.resolve('url/'),
    };
  }

  if (config.optimization && !codeSplit) {
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    );
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type SitePage implements Node {
      context: SitePageContext
    }
    type SitePageContext {
      foo: String
    }
  `);
  createTypes(`
    type Contributor {
      author: String
      avatar: String
      github: String
    }
    type MarkdownRemarkFrontmatter {
      icon: String
      order: Int
      redirect_from: [String]
      contributors: [Contributor]
    }

    type MarkdownRemark {
      frontmatter: MarkdownRemarkFrontmatter
    }
  `);

  createTypes(`
    type DocsearchOptions {
      apiKey: String
      indexName: String
      appId: String
    }

    type SiteSiteMetadataTitle {
      zh: String
      en: String
    }

    type SiteSiteMetadataEcosystemName {
      zh: String
      en: String
    }

    type Announcement {
      zh: String
      en: String
    }

    type SiteSiteMetadataDocs {
      slug: String!
      title: SiteSiteMetadataTitle!
      order: Int
    }

    type SiteSiteMetadataExamples {
      slug: String!
      title: SiteSiteMetadataTitle!
      icon: String
      order: Int
    }

    type SiteSiteMetadataNavs {
      slug: String!
      title: SiteSiteMetadataTitle!
      target: String
    }

    type SiteSiteMetadataRedirects {
      from: String!
      to: String
    }

    type Ecosystems {
      name: SiteSiteMetadataEcosystemName!
      url: String!
    }

    type SiteSiteMetadata {
      title: String!
      description: String!
      githubUrl: String!
      docsUrl: String
      siteUrl: String
      logoUrl: String
      navs: [SiteSiteMetadataNavs]
      docs: [SiteSiteMetadataDocs]
      examples: [SiteSiteMetadataExamples]
      redirects: [SiteSiteMetadataRedirects]
      isAntvSite: Boolean
      showChartResize: Boolean
      showAPIDoc: Boolean
      showGithubStar: Boolean
      showGithubCorner: Boolean
      showLanguageSwitcher: Boolean
      isOpenSumiSite: Boolean
      showDingTalkQRCode: Boolean
      dingTalkQRCode: String
      showWeChatQRCode: Boolean
      weChatQRCode: String
      showSearch: Boolean
      docsearchOptions: DocsearchOptions
      ecosystems: [Ecosystems]
      announcement: Announcement
    }

    type Site implements Node {
      siteMetadata: SiteSiteMetadata
      pathPrefix: String
    }
  `);
};
