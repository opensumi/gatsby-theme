import React, { useState, useEffect, useContext } from 'react';
import { withPrefix } from 'gatsby';
import { default as RCFooter, FooterProps as RcFooterProps } from 'rc-footer';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import omit from 'omit.js';
import { LayoutContext } from '../layouts/layout-context';
import * as styles from './Footer.module.less';
import 'rc-footer/assets/index.less';

interface FooterProps extends RcFooterProps {
  rootDomain?: string;
  language?: string;
  githubUrl?: string;
  location: Location;
}

const Footer: React.FC<FooterProps> = ({
  columns,
  bottom,
  theme = 'dark',
  language,
  rootDomain = '',
  location,
  ...restProps
}) => {
  const [withMenu, setWithMenu] = useState<boolean>(false);
  const { t } = useTranslation();
  const { collapsed } = useContext(LayoutContext);

  useEffect(() => {
    // 有 menu 的模版 footer 表现不同，通过 location 判断加载的模版
    const pathPrefix = withPrefix('/').replace(/\/$/, '');
    const path = location.pathname.replace(pathPrefix, '');
    const isExamplePage =
      path.startsWith(`/zh/examples`) || path.startsWith(`/en/examples`);
    const isDocsPage =
      path.startsWith(`/zh/docs`) || path.startsWith(`/en/docs`);
    // examples 页面里目前只有 gallery 是有 footer 的，
    // 且 gallery 会出现 `location.key = 'initial'` 逻辑，所以先统一处理为需要 menu
    if (isExamplePage) {
      setWithMenu(true);
    } else if (isDocsPage) {
      // 文档页为 404 时 footer 没有 menu
      setWithMenu(!((location as any).key === 'initial'));
    } else {
      setWithMenu(false);
    }
  }, [location]);

  const getColums = () => {
    // 如果外部没有传入 columns，则默认展示默认 footer
    const col1 = {
      title: t('资源'),
      items: [
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01JhV5ts1dKtJraHkGo_!!6000000003718-2-tps-36-36.png"
              alt={t('WebIDE 案例')}
            />
          ),
          title: t('WebIDE 案例'),
          url: 'https://github.com/opensumi/ide-startup',
          openExternal: true,
        },
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01mY1gO81erhIwTdhFK_!!6000000003925-2-tps-36-30.png"
              alt={t('Electron 案例')}
            />
          ),
          title: t('Electron 案例'),
          url: 'https://github.com/opensumi/ide-electron',
          openExternal: true,
        },
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN0186yMXa1ng5oNbsydA_!!6000000005118-2-tps-30-36.png"
              alt={t('纯前端案例')}
            />
          ),
          title: t('纯前端案例'),
          url: 'https://github.com/opensumi/ide-startup-lite',
          openExternal: true,
        },
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i4/O1CN01JDS6U626MprDmVM8D_!!6000000007648-2-tps-36-36.png"
              alt={t('官方主题')}
            />
          ),
          title: t('官方主题'),
          url: 'https://github.com/opensumi/Default-Themes',
          openExternal: true,
        },
      ],
    };

    const col2 = {
      title: t('社区'),
      items: [
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01ISm2G81GUIHuhCJJK_!!6000000000625-2-tps-124-90.png"
              alt="d2conf"
            />
          ),
          title: `D2 - ${t('D2 前端技术论坛')}`,
          url: 'https://d2.alibabatech.com/',
          openExternal: true,
        },
        {
          icon: (
            <img
              src="https://gw.alipayobjects.com/zos/rmsportal/mZBWtboYbnMkTBaRIuWQ.png"
              alt="seeconf"
            />
          ),
          title: `SEE Conf - ${t('蚂蚁体验科技大会')}`,
          url: 'https://seeconf.antfin.com/',
          openExternal: true,
        },
      ],
    };

    const col3 = {
      title: t('帮助'),
      items: [
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN01hOukdb26V4zGBJGyN_!!6000000007666-2-tps-48-48.png"
              alt="github"
            />
          ),
          title: 'GitHub Issues',
          url: 'https://github.com/opensumi/core/issues',
          openExternal: true,
        },
      ],
    };

    const more = {
      icon: (
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
          alt="more products"
        />
      ),
      title: t('更多产品'),
      items: [
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01P04WYq1HV2XD2XhTP_!!6000000000762-2-tps-180-172.png"
              alt={t('淘宝开发者工具')}
            />
          ),
          title: t('淘宝开发者工具'),
          url: 'https://miniapp-dev.taobao.com/',
          openExternal: true,
        },
        {
          icon: (
            <img
              src="https://img.alicdn.com/imgextra/i2/O1CN01DVM7ow1njIZNWiUnK_!!6000000005125-2-tps-180-172.png"
              alt={t('支付宝小程序开发工具')}
            />
          ),
          title: t('支付宝小程序开发工具'),
          url: 'https://opendocs.alipay.com/mini/ide/overview',
          openExternal: true,
        },
      ],
    };

    return [col1, col2, col3, more];
  };

  return (
    <RCFooter
      maxColumnsPerRow={5}
      theme={theme}
      columns={columns || getColums()}
      className={classnames(styles.footer, {
        [styles.withMenu]: withMenu,
        [styles.collapsed]: collapsed,
      })}
      bottom={
        bottom ||
        'Copyright © 2019-present Alibaba Group Holding Limited, Ant Group Co. Ltd.'
      }
      {...omit(restProps, ['githubUrl'])}
    />
  );
};

export default Footer;
