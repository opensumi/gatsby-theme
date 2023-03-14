module.exports = {
  plugins: [
    {
      resolve: '@opensumi/gatsby-theme',
      options: {
        GATrackingId: `UA-148148901-11`,
      },
    },
  ],
  siteMetadata: {
    title: 'OpenSumi',
    description:
      '一款帮助你快速搭建本地和云端 IDE 的框架 - A framework helps you quickly build Cloud or Desktop IDE products.',
    siteUrl: 'https://opensumi.com',
    logo: {
      img: 'https://img.alicdn.com/imgextra/i1/O1CN01XTErpN24JVlOVVK2I_!!6000000007370-2-tps-300-300.png',
      link: 'https://opensumi.com',
    },
    logoUrl:
      'https://img.alicdn.com/imgextra/i1/O1CN01XTErpN24JVlOVVK2I_!!6000000007370-2-tps-300-300.png',
    githubUrl: 'https://github.com/opensumi/core',
    docsUrl: 'https://github.com/opensumi/doc',
    navs: [
      {
        slug: 'docs/develop/how-to-contribute',
        title: {
          zh: '开发文档',
          en: 'Development',
        },
      },
    ],
    docs: [
      {
        slug: 'develop/sample',
        title: {
          zh: '开发案例',
          en: 'Develop Sample',
        },
        order: 4,
      },
    ],
    ecosystems: [
      {
        name: {
          zh: '插件市场',
          en: 'Extension Market',
        },
        url: '#',
      },
    ],
    showDingTalkQRCode: true,
    showWeChatQRCode: true,
    weChatQRCode:
      'https://img.alicdn.com/imgextra/i1/O1CN01jNQjmP1OXW4hj6p7s_!!6000000001715-2-tps-200-239.png',
    dingTalkQRCode:
      'https://img.alicdn.com/imgextra/i2/O1CN01Fcw6RC1T8qozkQBFG_!!6000000002338-2-tps-200-239.png',
    redirects: [],
    showGithubCorner: true, // 是否展示角落的 GitHub 图标
    showGithubStars: true,
    showLanguageSwitcher: true, // 用于定义是否展示语言切换
    showSearch: true,
  },
};
