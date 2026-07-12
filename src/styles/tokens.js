export const colors = {
  bg: {
    base: "#E6E1DD",
    raised: "#F1ECE7",
    elevated: "#F7F4F1",
    overlay: "rgba(30, 34, 38, 0.34)",
    overlayStrong: "rgba(30, 34, 38, 0.68)",
  },
  brand: {
    primary: "#304F6D",
    primaryPressed: "#27425C",
    primarySoft: "#D6E1EB",
  },
  ui: {
    secondary: "#899481",
    secondaryPressed: "#798470",
    secondarySoft: "#E4E8E1",
    disabled: "#C6C1BC",
  },
  accent: {
    warm: "#E07D54",
    warmPressed: "#C96D47",
    reward: "#FFE1A0",
    rewardSoft: "#FFF3D4",
    cool: "#E2F3FD",
    coolPressed: "#D4EAF6",
  },
  surface: {
    card: "#F3EEEA",
    cardMuted: "#EEE7E1",
    cardCool: "#EDF5F9",
    cardWarm: "#F7ECE6",
    cardReward: "#FFF5DA",
  },
  text: {
    primary: "#1F2327",
    secondary: "#54606B",
    muted: "#7B847C",
    inverse: "#FFFFFF",
    accent: "#304F6D",
    warm: "#A95735",
  },
  border: {
    subtle: "#D2CAC2",
    strong: "#C2B7AD",
    inverse: "rgba(255, 255, 255, 0.24)",
  },
  button: {
    primaryBg: "#304F6D",
    primaryBgPressed: "#27425C",
    primaryText: "#FFFFFF",
    secondaryBg: "#F6F1ED",
    secondaryBgPressed: "#EAE2DC",
    secondaryBorder: "#304F6D",
    secondaryText: "#304F6D",
    tertiaryBg: "#E2F3FD",
    tertiaryBgPressed: "#D4EAF6",
    tertiaryText: "#304F6D",
    destructiveBg: "#E07D54",
    destructiveBgPressed: "#C96D47",
    destructiveText: "#FFFFFF",
  },
  status: {
    track: "#D2CAC2",
    trackEmphasis: "#B4AAA0",
    positive: "#899481",
    neutral: "#A3988E",
    info: "#B9DCEC",
    warning: "#E07D54",
    reward: "#FFE1A0",
    bond: "#899481",
    money: "#304F6D",
    successText: "#5B6655",
    dangerText: "#A95735",
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const typography = {
  eyebrow: 12,
  label: 13,
  body: 15,
  bodyLarge: 16,
  titleSm: 18,
  titleMd: 22,
  titleLg: 30,
  hero: 38,
};

export const shadow = {
  card: {
    shadowColor: "#1E2226",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: "#1E2226",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  modal: {
    shadowColor: "#1E2226",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const cardTiers = {
  primary: {
    backgroundColor: colors.surface.card,
    borderColor: colors.border.strong,
    borderWidth: 1,
    shadow: shadow.card,
    padding: spacing.xl,
  },
  secondary: {
    backgroundColor: colors.bg.elevated,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    shadow: shadow.card,
    padding: spacing.lg,
  },
  utility: {
    backgroundColor: colors.surface.cardMuted,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    shadow: shadow.card,
    padding: spacing.md,
  },
};

export const modalLayout = {
  maxHeight: "85%",
  wideMaxHeight: "86%",
  footerPadding: spacing.lg,
  bodyGap: spacing.md,
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
  cardTiers,
  modalLayout,
};
