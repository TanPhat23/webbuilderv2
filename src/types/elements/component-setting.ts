export type ComponentOverride = {
  text?: string;
  src?: string;
  alt?: string;
  href?: string;
};

export type ComponentOverrides = Record<string, ComponentOverride>;

export type ComponentSetting = {
  pageId: string;
  rootId: string;
  overrides?: ComponentOverrides;
};
