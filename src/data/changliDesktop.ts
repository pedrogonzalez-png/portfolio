/**
 * CHANGLI — media and preview data, in ONE editable place.
 *
 * To supply artwork later:
 * 1. Add files inside public/assets/hyprland/changli/
 * 2. Replace the empty strings below with e.g.
 *    "/assets/hyprland/changli/background.mp4"
 *    "/assets/hyprland/changli/right-portrait.webp"
 *
 * Empty media fields intentionally draw CSS-only placeholders instead of
 * fetching broken links. Video is a local asset, NEVER a remote URL.
 * No original images, private notes, or PC system telemetry are bundled.
 */
export const changliDesktop = {
  media: {
    backgroundVideo: "",
    backgroundImage: "",
    profileBanner: "",
    profileAvatar: "",
    featureArtwork: "",
    rightPortrait: "",
    brandArtwork: "",
  },
  profile: {
    handle: "autor@Archlinux",
    days: "0",
    hours: "13",
    minutes: "18",
  },
  notes: [
    "Anotação do desktop",
    "Comando favorito",
    "Link de referência",
  ],
  tasks: [
    "Organizar o próximo projeto",
    "Revisar os temas",
    "Conferir os widgets",
  ],
  weatherSample: {
    city: "Campinas",
    temperature: "26",
    summary: "Nublado",
    humidity: "57%",
    wind: "2,99 m/s",
    rain: "75%",
    visibility: "10 km",
    sunrise: "06:25",
    sunset: "18:18",
  },
  sampleMeters: [
    { label: "CPU", value: 15, icon: "◈" },
    { label: "RAM", value: 45, icon: "✿" },
    { label: "Disco", value: 57, icon: "▤" },
  ],
} as const;
