import React from 'react';
import { navigate, graphql, StaticQuery } from 'gatsby';
import { getUserLangKey } from 'ptz-i18n';
import { withTranslation, WithTranslation } from 'react-i18next';
import Seo from './Seo';
import PageLoading from './PageLoading';

class RedirectIndex extends React.PureComponent<WithTranslation> {
  langKey = '';

  constructor(args: any) {
    super(args);

    // Skip build, Browsers only
    if (typeof window !== 'undefined') {
      const langKey = getUserLangKey(['zh', 'en'], 'zh');
      this.langKey = langKey;
      // https://github.com/angeloocana/gatsby-plugin-i18n/issues/52#issuecomment-451590961
      navigate(langKey);
    }
  }

  renderIndex = (data: {
    site: {
      siteMetadata: {
        title?: string;
      };
    };
  }) => {
    const { t } = this.props;
    const {
      site: {
        siteMetadata: { title = '' },
      },
    } = data;
    return (
      <>
        <Seo
          title={title || 'OpenSumi'}
          titleSuffix={t('OpenSumi 框架')}
          description={t('一款帮助你快速搭建本地和云端 IDE 的框架。')}
          lang={this.langKey}
        />
        <PageLoading />
      </>
    );
  };

  render() {
    return (
      <StaticQuery
        query={graphql`
          query HeadingQuery {
            site {
              siteMetadata {
                title
              }
            }
          }
        `}
        render={this.renderIndex}
      />
    );
  }
}

export default withTranslation()(RedirectIndex);
