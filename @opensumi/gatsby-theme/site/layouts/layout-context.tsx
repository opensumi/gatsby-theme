import React from 'react';

export interface ILayoutContext {
  collapsed: boolean;
  setCollapsed: any;
}

export const LayoutContext = React.createContext<ILayoutContext>({
  collapsed: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCollapsed: () => {},
});
