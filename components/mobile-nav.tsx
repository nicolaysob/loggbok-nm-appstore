export type AppNavLink = {
  href: string;
  label: string;
};

export type AppNavGroup = {
  title?: string;
  links: AppNavLink[];
};
