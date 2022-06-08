import React from 'react';
import { DocSearch } from '@docsearch/react';
import '@docsearch/css';
import * as styles from './Search.module.less';

export interface SearchProps {
  docsearchOptions?: {
    apiKey: string;
    indexName: string;
    appId: string;
  };
  lang: string;
}

const Search: React.FC<SearchProps> = ({ docsearchOptions, lang }) => {
  if (!docsearchOptions) {
    return <></>;
  }
  const translations = {
    button: {
      buttonText: lang === 'zh' ? '搜索文档' : 'Search docs',
      buttonAriaLabel: lang === 'zh' ? '搜索文档' : 'Search docs',
    },
    modal: {
      searchBox: {
        resetButtonTitle: lang === 'zh' ? '清理查询' : 'Clear the query',
        resetButtonAriaLabel: lang === 'zh' ? '清理查询' : 'Clear the query',
        cancelButtonText: lang === 'zh' ? '取消' : 'Cancel',
        cancelButtonAriaLabel: lang === 'zh' ? '取消' : 'Cancel',
      },
      startScreen: {
        recentSearchesTitle: lang === 'zh' ? '最近' : 'Recent',
        noRecentSearchesText:
          lang === 'zh' ? '无最近搜索' : 'No recent searches',
        saveRecentSearchButtonTitle:
          lang === 'zh' ? '保存该搜索' : 'Save this search',
        removeRecentSearchButtonTitle:
          lang === 'zh'
            ? '从历史中移除该搜索'
            : 'Remove this search from history',
        favoriteSearchesTitle: lang === 'zh' ? '喜欢' : 'Favorite',
        removeFavoriteSearchButtonTitle:
          lang === 'zh'
            ? '从喜欢中移除该搜索'
            : 'Remove this search from favorites',
      },
      errorScreen: {
        titleText: lang === 'zh' ? '无法查询到结果' : 'Unable to fetch results',
        helpText:
          lang === 'zh'
            ? '请检查一下网络连接情况'
            : 'You might want to check your network connection.',
      },
      footer: {
        selectText: lang === 'zh' ? '选择' : 'to select',
        selectKeyAriaLabel: lang === 'zh' ? 'Enter 键' : 'Enter key',
        navigateText: lang === 'zh' ? '跳转' : 'to navigate',
        navigateUpKeyAriaLabel: lang === 'zh' ? 'Arrow up' : 'Arrow up',
        navigateDownKeyAriaLabel: lang === 'zh' ? 'Arrow down' : 'Arrow down',
        closeText: lang === 'zh' ? '关闭' : 'to close',
        closeKeyAriaLabel: lang === 'zh' ? 'Escape 键' : 'Escape key',
        searchByText: lang === 'zh' ? '搜索' : 'Search by',
      },
      noResultsScreen: {
        noResultsText: lang === 'zh' ? '查询不到结果' : 'No results for',
        suggestedQueryText: lang === 'zh' ? '尝试搜索' : 'Try searching for',
        reportMissingResultsText:
          lang === 'zh'
            ? '确定该查询应该返回结果？'
            : 'Believe this query should return results?',
        reportMissingResultsLinkText:
          lang === 'zh' ? '让我们知道' : 'Let us know.',
      },
    },
  };
  return (
    <div className={styles.search}>
      <DocSearch
        {...docsearchOptions}
        searchParameters={{
          facetFilters: [`lang:${lang}`],
        }}
        translations={translations}
      />
    </div>
  );
};

export default Search;
