const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  needle: "M12 2v20M8 6l4-4 4 4M9 18a3 3 0 1 0 6 0",
  bag: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5",
  menu: "M4 7h16M4 12h16M4 17h16",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2z",
  instagram: "M4 4h16v16H4zM12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7M17 7h.01",
  tiktok: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5",
  pin: "M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2",
  check: "M5 12l5 5L20 7",
  plus: "M12 5v14M5 12h14",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM7.5 13.5c2.6 2.6 6.4 2.6 9 0M7.5 13.5h9M9.5 13.5v1.6M12 13.5v2M14.5 13.5v1.6M9 9.5h.01M15 9.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
};

export default function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] || ""} />
    </svg>
  );
}
