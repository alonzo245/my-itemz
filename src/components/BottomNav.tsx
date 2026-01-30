import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Items" },
  { to: "/categories", label: "Categories" },
  { to: "/insights", label: "Insights" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-700 bg-bg-card safe-area-pb touch-target">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm font-medium transition-colors touch-target ${
              isActive ? "text-primary" : "text-gray-400 hover:text-text"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
