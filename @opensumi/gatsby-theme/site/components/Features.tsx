import React from 'react';
import { useTranslation } from 'react-i18next';
import * as styles from './Features.module.less';

interface IFeature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  title?: string;
  features: IFeature[];
}

const Feature: React.FC<IFeature> = React.memo(
  ({ icon, title, description }) => {
    return (
      <div className={styles.feature}>
        <img className={styles.featureImage} src={icon} alt={title} />
        <div className={styles.featureWrap}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    );
  },
);

const Features: React.FC<FeaturesProps> = React.memo(({ title, features }) => {
  const { t } = useTranslation();

  return (
    <>
      <section className={styles.features}>
        <div className={styles.title}>
          <span>{title || t('能力特性')}</span>
        </div>
        <div className="container">
          <div className={styles.feature_row}>
            {features.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
});

export default Features;
