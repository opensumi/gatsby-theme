import React from 'react';
import { render } from '@testing-library/react';

import Header from '../components/Header';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

describe(`Header`, () => {
  it.skip(`renders menu`, () => {
    const siteTitle = `Hello World`;
    const { getByText } = render(
      <Header siteTitle={siteTitle} pathPrefix="/xxx" />,
    );
    expect(getByText('https://opensumi.com/en')).toBeInTheDocument();
  });
});
