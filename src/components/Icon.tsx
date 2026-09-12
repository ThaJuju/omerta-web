/// Icones inline : l'ancien site chargeait tout Font Awesome depuis un CDN
/// pour six glyphes. Ici elles sont dans le bundle, sans requete reseau.
export type IconName =
  | "home"
  | "book"
  | "users"
  | "cart"
  | "discord"
  | "lock"
  | "check"
  | "cross"
  | "clock"
  | "arrowLeft"
  | "arrowRight"
  | "logout"
  | "mic"
  | "chat"
  | "gamepad"
  | "menu"
  | "shield"
  | "scale"
  | "mask"
  | "chevronDown"
  | "news"
  | "pen"
  | "trash"
  | "plus"
  | "eye"
  | "tag"
  | "pin";

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  book: <path d="M4 4h9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4zm16 0h-1a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z" />,
  users: (
    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2c-3.9 0-7 2-7 4.5V21h14v-3.5C16 15 12.9 13 9 13m8.5-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 13c-.6 0-1.2.1-1.7.2 1.1 1.1 1.7 2.5 1.7 4.3V21h4v-3.2c0-2.3-2.5-4.8-4-4.8" />
  ),
  cart: (
    <path d="M2 3h3l3 12h11l2-8H7m2 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
  ),
  discord: (
    <path d="M19.3 5.3A16 16 0 0 0 15.4 4l-.2.4a12 12 0 0 1 3.4 1.7 15 15 0 0 0-12.9-.5q.8-.5 1.6-.8L7.1 4a16 16 0 0 0-3.9 1.3C.8 9 .1 12.5.4 16a16 16 0 0 0 4.9 2.5l1-1.6q-1.2-.4-2.2-1.1l.5-.4a11.4 11.4 0 0 0 9.7 0l.5.4q-1 .7-2.2 1.1l1 1.6a16 16 0 0 0 5-2.5c.4-4-.8-7.5-3.3-10.7M8.4 13.9c-1 0-1.7-.9-1.7-2s.8-2 1.7-2c1 0 1.8.9 1.7 2s-.7 2-1.7 2m6.3 0c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.8.9 1.7 2-.7 2-1.7 2" />
  ),
  lock: <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h8V8a4 4 0 1 0-8 0z" />,
  check: <path d="M9.5 17.6 4 12.1l1.5-1.5 4 4 9-9L20 7z" />,
  cross: <path d="m12 10.6 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4z" />,
  clock: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 10.4 4 2.4-1 1.7-5-3V6h2z" />,
  arrowLeft: <path d="M11 5 4 12l7 7 1.4-1.4L7.8 13H20v-2H7.8l4.6-4.6z" />,
  arrowRight: <path d="m13 5 7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6z" />,
  logout: <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5zm6.2 3.6L14.8 8l3 3H9v2h8.8l-3 3 1.4 1.4L21.6 12z" />,
  mic: <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3m6-3a6 6 0 0 1-5 5.9V20h3v2H8v-2h3v-3.1A6 6 0 0 1 6 11h2a4 4 0 0 0 8 0z" />,
  chat: <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V5a2 2 0 0 1 2-2z" />,
  menu: <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />,
  shield: <path d="M12 2 4 5v6.1c0 4.9 3.4 9.4 8 10.9 4.6-1.5 8-6 8-10.9V5zm0 5a2.5 2.5 0 0 1 2.5 2.5c0 1-.6 1.9-1.5 2.3V15h-2v-3.2a2.5 2.5 0 0 1 1-4.8" />,
  scale: <path d="M12 2a1 1 0 0 1 1 1v1.2l6 1.3V7l-2.2-.5 3.1 6.2a4 4 0 0 1-7.8 0l3-6.1-2.1-.5V19h4v2H7v-2h4V6.1l-2.1.5 3 6.1a4 4 0 0 1-7.8 0l3.1-6.2L5 7V5.5l6-1.3V3a1 1 0 0 1 1-1" />,
  mask: <path d="M12 3c3.3 0 6.4.7 8.5 1.8.3 3.6-.4 7.6-2.2 10.2C16.7 17.4 14.4 19 12 21c-2.4-2-4.7-3.6-6.3-6C3.9 12.4 3.2 8.4 3.5 4.8 5.6 3.7 8.7 3 12 3M8.4 9.2c-.8 0-1.4.7-1.4 1.5s.6 1.5 1.4 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5m7.2 0c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.4-.7 1.4-1.5-.6-1.5-1.4-1.5M12 14.5c-1.3 0-2.5.4-3.4 1 .9 1 2.1 1.6 3.4 1.6s2.5-.6 3.4-1.6c-.9-.6-2.1-1-3.4-1" />,
  chevronDown: <path d="M12 15.4 5.6 9 7 7.6l5 5 5-5L18.4 9z" />,
  news: <path d="M3 4h14a1 1 0 0 1 1 1v13a2 2 0 0 0 2 2H5a2 2 0 0 1-2-2zm2 3v4h5V7zm7 0v2h4V7zm0 4v2h4v-2zm-7 4v2h11v-2zm14-5h2v9a1 1 0 0 1-2 0z" />,
  pen: <path d="M3 17.2V21h3.8L18 9.8 14.2 6zm18-11.6a1 1 0 0 0 0-1.4l-2.2-2.2a1 1 0 0 0-1.4 0L15.6 4l3.8 3.8z" />,
  trash: <path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zm3 2v8h2v-8zm4 0v8h2v-8z" />,
  plus: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />,
  eye: <path d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7c-1.2-2.6-5-7-10.5-7m0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />,
  tag: <path d="M11 2H3a1 1 0 0 0-1 1v8l11 11 9-9L11 2M6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />,
  pin: <path d="M16 2 8.8 5.2 5.6 8.4l4 4-6.6 6.6v2h2l6.6-6.6 4 4 3.2-3.2L22 8z" />,
  gamepad: (
    <path d="M7 7h10a5 5 0 0 1 5 5v3a3 3 0 0 1-5.4 1.8L15 15H9l-1.6 1.8A3 3 0 0 1 2 15v-3a5 5 0 0 1 5-5m0 3v2H5v2h2v2h2v-2h2v-2H9v-2zm9 1a1.2 1.2 0 1 0 0 2.5 1.2 1.2 0 0 0 0-2.5m2.5 2.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4" />
  ),
};

export function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {paths[name]}
    </svg>
  );
}
