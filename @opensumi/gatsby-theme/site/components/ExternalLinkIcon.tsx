import React from 'react';
import ExternalLink from '../images/external-link.svg';
import * as styles from './ExternalLinkIcon.module.less';

const ExternalLinkIcon: React.FC = () => (
  <i className={styles.external}>
    <ExternalLink />
  </i>
);

export default ExternalLinkIcon;
