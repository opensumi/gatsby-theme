/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
import React from 'react';
import * as styles from './CopyRightFooter.module.less';

const CopyRightFooter: React.FC<any> = () => {
  const verifyKeyHref = `https://zzlz.gsxt.gov.cn/businessCheck/verifKey.do?showType=p&serial=91330108MA2AYCWE65-SAIC_SHOW_10000091330108MA2AYCWE651662000584734&signData=MEUCIFcsKwNu/rQ5rrBh2z++tkTxVeDIZAap1f+Uzd6IPb0nAiEA10s1nYu1D/w/v6jVuY4feYmkw9xdKIB/i8YGqygl2/U=`;
  return (
    <div className={styles.site_footer}>
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
