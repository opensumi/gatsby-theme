const fs = require('fs');
const path = require('path');
const queries = require('./utils/algolia-queries');

const { name } = JSON.parse(
  fs.readFileSync(path.resolve(`package.json`), `utf8`),
);

module.exports = ({
  pagesPath = './site/pages',
  GATrackingId,
  theme = {
    'primary-color': '#873bf4',
  },
  pathPrefix,
  pwa = false,
  cname = true,
}) => {
  const config = {
    siteMetadata: {
      title: `OpenSumi`,
      description: `OpenSumi Doc Theme`,
      siteUrl: 'https://opensumi.com',
      githubUrl: 'https://github.com/opensumi/gatsby-theme',
      navs: [],
      docs: [],
      examples: [],
      isOpenSumiSite: false,
    },
    plugins: [
      `gatsby-plugin-react-helmet`,
      {
        resolve: `gatsby-plugin-no-sourcemaps`,
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `docs`,
          path: path.resolve('./docs'),
          ignore: [`**/.*`],
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `images`,
          path: path.resolve('./site/images'),
          ignore: [`**/.*`],
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `examples`,
          path: path.resolve('./examples'),
          ignore: [`**/.*`],
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `common.json`,
          path: `${__dirname}/site/common.json`,
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `locale.json`,
          path: path.resolve('./site/locale.json'),
        },
      },
      {
        resolve: 'gatsby-plugin-copy-files',
        options: {
          source: path.resolve('./examples/data'),
          destination: `zh/examples/data`,
        },
      },
      {
        resolve: 'gatsby-plugin-copy-files',
        options: {
          source: path.resolve('./examples/data'),
          destination: `en/examples/data`,
        },
      },
      {
        resolve: 'gatsby-plugin-i18n',
        options: {
          langKeyDefault: 'zh',
          useLangKeyLayout: false,
          pagesPaths: [`${__dirname}/site/pages`, path.resolve(pagesPath)],
        },
      },
      {
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [
            {
              resolve: `${__dirname}/plugins/gatsby-remark-embed-markdown`,
              options: {
                directory: path.resolve('./'),
              },
            },
            {
              resolve: `gatsby-remark-prismjs`,
              options: {
                inlineCodeMarker: '±',
              },
            },
            {
              resolve: 'gatsby-remark-external-links',
              options: {
                target: '_self',
                rel: 'nofollow',
              },
            },
            `gatsby-remark-autolink-headers`,
            `@rstacruz/gatsby-remark-component`,
          ],
        },
      },
      pwa ? `gatsby-plugin-offline` : `gatsby-plugin-remove-serviceworker`,
      {
        resolve: `gatsby-plugin-manifest`,
        options: {
          name,
          short_name: name,
          start_url: `/`,
          background_color: theme['primary-color'],
          theme_color: theme['primary-color'],
          display: `minimal-ui`,
          icon: require.resolve(`./site/images/favicon.png`), // This path is relative to the root of the site.
        },
      },
      `gatsby-plugin-typescript`,
      {
        resolve: 'gatsby-plugin-less',
        options: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#873bf4',
              'text-color': '#0D1A26',
              'heading-color': '#0D1A26',
              'menu-item-color': '#314659',
              'font-family': `Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif`,
              ...theme,
            },
          },
        },
      },
      {
        resolve: 'gatsby-plugin-react-svg',
        options: {
          rule: {
            include: /images/, // See below to configure properly
          },
        },
      },
      {
        resolve: 'gatsby-plugin-antd',
        options: {
          style: true,
        },
      },
      `gatsby-plugin-catch-links`,
      `gatsby-plugin-sitemap`,
      `gatsby-plugin-nprogress`,
      `gatsby-plugin-remove-trailing-slashes`,
      // You can have multiple instances of this plugin
      // to create pages from React components in different directories.
      //
      // The following sets up the pattern of having multiple
      // "pages" directories in your project
      {
        resolve: `gatsby-plugin-page-creator`,
        options: {
          path: `${__dirname}/site/pages`,
        },
      },
      {
        resolve: `gatsby-plugin-page-creator`,
        options: {
          path: path.resolve(pagesPath),
        },
      },
      {
        resolve: `gatsby-plugin-layout`,
        options: {
          component: require.resolve(`./site/layouts/layout.tsx`),
        },
      },
      {
        resolve: `gatsby-plugin-nprogress`,
        options: {
          // Setting a color is optional.
          color: theme['primary-color'],
        },
      },
    ],
  };
  if (process.env.GATSBY_ALGOLIA_APP_ID) {
    config.plugins.push({
      resolve: `gatsby-plugin-algolia`,
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries,
      },
    });
  }

  if ('GATSBY_PATH_PREFIX' in process.env) {
    // eslint-disable-next-line no-console
    console.log(
      `'GATSBY_PATH_PREFIX' in process.env: ${process.env.GATSBY_PATH_PREFIX}`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `typeof process.env.GATSBY_PATH_PREFIX: ${typeof process.env
        .GATSBY_PATH_PREFIX}`,
    );
    if (
      process.env.GATSBY_PATH_PREFIX &&
      process.env.GATSBY_PATH_PREFIX !== '/'
    ) {
      config.pathPrefix = process.env.GATSBY_PATH_PREFIX;
    }
  } else if (pathPrefix) {
    config.pathPrefix = pathPrefix;
  }

  if (GATrackingId) {
    config.plugins.push({
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [GATrackingId],
      },
    });
  }

  if (cname) {
    config.plugins.push('gatsby-plugin-cname');
  }
  return config;
};
