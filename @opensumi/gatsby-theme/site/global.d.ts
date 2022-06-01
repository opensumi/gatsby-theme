declare module '*.less' {
  const content: { [className: string]: string };
  export = content;
}
declare module '*.css';
declare module '@babel/standalone';
