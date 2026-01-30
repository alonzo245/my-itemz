import { Link } from 'react-router-dom';

export function FAB() {
  return (
    <Link
      to="/items/new"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-lg transition-transform active:scale-95 touch-target"
      aria-label="Add item"
    >
      +
    </Link>
  );
}
