import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'gatsby';
import Slider from 'react-slick';
import classNames from 'classnames';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import * as styles from './Cases.module.less';

interface Case {
  logo?: string;
  isAppLogo?: boolean;
  title: string;
  description: string;
  link?: string;
  image: string;
}
interface CasesProps {
  cases: Case[];
  style?: React.CSSProperties;
  className?: string;
}
const Cases: React.FC<CasesProps> = ({ cases = [], style = {}, className }) => {
  const { t } = useTranslation();
  let slider: any;

  const clickPrevious = () => {
    slider.slickPrev();
  };
  const clickNext = () => {
    slider.slickNext();
  };

  const getCases = () => {
    let buttons: any;
    if (cases.length > 1) {
      buttons = (
        <div className={styles.appButtons}>
          <div
            className={classNames(styles.controlButton, styles.left)}
            onClick={clickPrevious}
          />
          <div
            className={classNames(styles.controlButton, styles.right)}
            onClick={clickNext}
          />
        </div>
      );
    }
    const children = cases.map((app) => {
      const linkDiv = (
        <div
          className={styles.detailWrapper}
          style={{ display: app.link ? 'block' : 'none' }}
        >
          {app.link && app.link.startsWith('http') ? (
            <a
              className={styles.detail}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('查看详情')}
            </a>
          ) : (
            <Link className={styles.detail} to={app.link ? app.link : ''}>
              {t('查看详情')}
            </Link>
          )}
        </div>
      );

      return (
        <div className={styles.appWrapper} key={app.title}>
          <img className={styles.appTeaser} src={app.image} alt={app.title} />
          <div className={styles.appLeft}>
            <div className={styles.appContent}>
              <img
                className={styles.appLogo}
                src={app.logo}
                alt="logo"
                style={{
                  borderRadius: app.isAppLogo ? '15px' : '0px',
                  boxShadow: app.isAppLogo
                    ? '0px 12px 24px #CED4D9'
                    : '0px 0px 0px',
                }}
              />
              <p className={styles.appTitle}>{app.title}</p>
              <p className={styles.appDescription}>{app.description}</p>
              {linkDiv}
            </div>
          </div>
          {buttons}
        </div>
      );
    });
    return children;
  };

  const sliderSettings = {
    dots: cases.length > 1,
    infinite: true,
    slidesToShow: 1,
    adaptiveHeight: true,
    speed: 500,
    cssEase: 'linear',
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
  };
  return (
    <div className={classNames(styles.wrapper, className)} style={style}>
      <div className={styles.title}>{t('产品案例')}</div>
      <Slider
        {...sliderSettings}
        className={styles.slider}
        ref={(c) => {
          slider = c;
        }}
      >
        {getCases()}
      </Slider>
    </div>
  );
};
export default Cases;
