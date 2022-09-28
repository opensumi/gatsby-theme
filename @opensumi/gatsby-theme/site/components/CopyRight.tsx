/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
import React, { useContext, useEffect, useState } from 'react';
import { withPrefix } from 'gatsby';
import classnames from 'classnames';
import * as styles from './CopyRightFooter.module.less';
import { LayoutContext } from '../layouts/layout-context';

interface CopyRightFooterProps {
  location: Location;
}

const CopyRightFooter: React.FC<CopyRightFooterProps> = ({ location }) => {
  const [withMenu, setWithMenu] = useState<boolean>(false);
  const { collapsed } = useContext(LayoutContext);

  useEffect(() => {
    const pathPrefix = withPrefix('/').replace(/\/$/, '');
    const path = location.pathname.replace(pathPrefix, '');
    const isExamplePage =
      path.startsWith(`/zh/examples`) || path.startsWith(`/en/examples`);
    const isDocsPage =
      path.startsWith(`/zh/docs`) || path.startsWith(`/en/docs`);
    if (isExamplePage) {
      setWithMenu(true);
    } else if (isDocsPage) {
      // 文档页为 404 时 footer 没有 menu
      setWithMenu(!((location as any).key === 'initial'));
    } else {
      setWithMenu(false);
    }
  }, [location]);

  const verifyKeyHref = `https://zzlz.gsxt.gov.cn/businessCheck/verifKey.do?showType=p&serial=91330108MA2AYCWE65-SAIC_SHOW_10000091330108MA2AYCWE651662000584734&signData=MEUCIFcsKwNu/rQ5rrBh2z++tkTxVeDIZAap1f+Uzd6IPb0nAiEA10s1nYu1D/w/v6jVuY4feYmkw9xdKIB/i8YGqygl2/U=`;
  return (
    <div
      className={classnames(styles.site_footer, {
        [styles.withMenu]: withMenu,
        [styles.collapsed]: collapsed,
      })}
    >
      <a href={verifyKeyHref} className={styles.varify_icon} target="_blank">
        {' '}
      </a>
      <span className={styles.split_line}>|</span>
      <a
        target="_blank"
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33010802012631"
        className={styles.record}
      >
        <div className={styles.icon} />
        浙公网安备 33010802012631号
      </a>
      <span className={styles.split_line}>|</span>
      <a href="http://beian.miit.gov.cn/">浙ICP备19028187号-131</a>
    </div>
  );
};

export default CopyRightFooter;
