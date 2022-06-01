import React from 'react';
import * as styles from './BannerSVG.module.less';

const BannerSVG = React.memo(() => {
  return (
    <img
      className={styles.wrapper}
      alt=""
      src="https://img.alicdn.com/imgextra/i3/O1CN01ZhXnrB1EJdqMYA76v_!!6000000000331-1-tps-776-666.gif"
    />
  );
});

export default BannerSVG;
