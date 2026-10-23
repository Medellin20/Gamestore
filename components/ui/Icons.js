const make = (d, extra) => function Icon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}{extra}
    </svg>
  );
};
export const CartIcon = make(['M6 6h15l-1.5 9h-12z', 'M6 6 5 3H2', 'M9 20h.01', 'M18 20h.01']);
export const SearchIcon = make(['M21 21l-4.3-4.3', 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z']);
export const MenuIcon = make(['M4 6h16', 'M4 12h16', 'M4 18h16']);
export const XIcon = make(['M6 6l12 12', 'M18 6 6 18']);
export const PlusIcon = make(['M12 5v14', 'M5 12h14']);
export const MinusIcon = make(['M5 12h14']);
export const TrashIcon = make(['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3']);
export const CheckIcon = make(['M5 12.5 10 17.5 19 7']);
export const UploadIcon = make(['M12 16V4', 'M7 9l5-5 5 5', 'M4 20h16']);
export const StarIcon = make(['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z']);
export const SwapIcon = make(['M7 4 3 8l4 4', 'M3 8h14', 'M17 20l4-4-4-4', 'M21 16H7']);
export const EditIcon = make(['M4 20h4L19 9l-4-4L4 16z']);
export const BackIcon = make(['M15 5l-7 7 7 7']);
