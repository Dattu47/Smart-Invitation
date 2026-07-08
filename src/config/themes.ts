export type InvitationTheme = "wedding" | "party" | "corporate";

export interface ThemeStyles {
  bodyBgClass: string;
  glow1Class: string;
  glow2Class: string;
  glow3Class: string;
  fontClass: string;
  titleGradientClass: string;
  subtitleColorClass: string;
  dividerBgClass: string;
  cardBgClass: string;
  iconContainerBgClass: string;
  iconColorClass: string;
  labelColorClass: string;
  valueColorClass: string;
  directionButtonClass: string;
  calendarButtonClass: string;
  footerHeartColorClass: string;
  footerLinkColorClass: string;
  particleBorderColorClass: string;
}

export const THEME_STYLES_MAP: Record<InvitationTheme, ThemeStyles> = {
  wedding: {
    bodyBgClass: "bg-wedding-purple-dark",
    glow1Class: "from-wedding-purple-mid to-wedding-purple-light opacity-35",
    glow2Class: "from-wedding-purple-light to-wedding-pink opacity-25",
    glow3Class: "bg-wedding-gold/5",
    fontClass: "font-serif",
    titleGradientClass: "text-wedding-gradient font-serif",
    subtitleColorClass: "text-wedding-pink/60",
    dividerBgClass: "bg-wedding-gold/25",
    cardBgClass: "bg-wedding-glass wedding-glow border-wedding-gold/25",
    iconContainerBgClass: "bg-wedding-purple-light/40 border-wedding-gold/15",
    iconColorClass: "text-wedding-gold",
    labelColorClass: "text-wedding-pink/60",
    valueColorClass: "text-wedding-gold-light",
    directionButtonClass: "bg-gradient-to-r from-wedding-gold-dark via-wedding-gold to-wedding-gold-dark text-wedding-purple-dark shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.45)]",
    calendarButtonClass: "bg-gradient-to-r from-wedding-purple-light/80 via-wedding-purple-mid/95 to-wedding-purple-light/80 text-wedding-pink border border-wedding-pink/30 shadow-[0_4px_20px_rgba(251,207,232,0.08)] hover:shadow-[0_4px_30px_rgba(251,207,232,0.18)] hover:border-wedding-pink/55",
    footerHeartColorClass: "text-wedding-gold/50 fill-wedding-gold/25",
    footerLinkColorClass: "text-wedding-pink/50",
    particleBorderColorClass: "border-wedding-gold/10 bg-wedding-pink/5",
  },
  party: {
    bodyBgClass: "bg-party-blue-dark",
    glow1Class: "from-party-blue-mid to-party-blue-light opacity-40",
    glow2Class: "from-party-blue-light to-party-pink opacity-30",
    glow3Class: "bg-party-cyan/5",
    fontClass: "font-sans",
    titleGradientClass: "text-party-gradient font-sans font-extrabold tracking-tight",
    subtitleColorClass: "text-party-cyan/60",
    dividerBgClass: "bg-party-pink/30",
    cardBgClass: "bg-party-glass party-glow border border-party-cyan/20",
    iconContainerBgClass: "bg-party-blue-light/50 border border-party-cyan/15",
    iconColorClass: "text-party-cyan",
    labelColorClass: "text-party-cyan/60",
    valueColorClass: "text-white",
    directionButtonClass: "bg-gradient-to-r from-party-cyan to-party-pink text-party-blue-dark shadow-[0_4px_20px_rgba(34,211,238,0.25)] hover:shadow-[0_4px_30px_rgba(244,63,94,0.45)]",
    calendarButtonClass: "bg-gradient-to-r from-party-blue-mid via-party-blue-light to-party-blue-mid text-party-cyan border border-party-cyan/40 shadow-[0_4px_20px_rgba(34,211,238,0.08)] hover:shadow-[0_4px_30px_rgba(34,211,238,0.18)] hover:border-party-cyan/70",
    footerHeartColorClass: "text-party-pink/50 fill-party-pink/25",
    footerLinkColorClass: "text-party-cyan/50",
    particleBorderColorClass: "border-party-cyan/10 bg-party-pink/5",
  },
  corporate: {
    bodyBgClass: "bg-corp-dark",
    glow1Class: "from-corp-mid to-corp-light opacity-30",
    glow2Class: "from-corp-light to-slate-800 opacity-20",
    glow3Class: "bg-corp-amber/5",
    fontClass: "font-sans",
    titleGradientClass: "text-corp-gradient font-sans font-semibold tracking-wide",
    subtitleColorClass: "text-corp-silver/60",
    dividerBgClass: "bg-corp-silver/20",
    cardBgClass: "bg-corp-glass corp-glow border border-corp-silver/15",
    iconContainerBgClass: "bg-corp-light/40 border border-corp-silver/10",
    iconColorClass: "text-corp-amber",
    labelColorClass: "text-corp-silver/50",
    valueColorClass: "text-corp-silver",
    directionButtonClass: "bg-gradient-to-r from-corp-amber to-corp-amber-light text-corp-dark shadow-[0_4px_20px_rgba(234,179,8,0.2)] hover:shadow-[0_4px_30px_rgba(234,179,8,0.35)]",
    calendarButtonClass: "bg-gradient-to-r from-corp-mid via-corp-light to-corp-mid text-corp-silver border border-corp-silver/30 shadow-[0_4px_15px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.1)] hover:border-corp-silver/60",
    footerHeartColorClass: "text-corp-amber/40 fill-corp-amber/15",
    footerLinkColorClass: "text-corp-silver/50",
    particleBorderColorClass: "border-corp-silver/10 bg-corp-silver/5",
  },
};
