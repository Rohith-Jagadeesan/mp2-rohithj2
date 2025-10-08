import cn from 'classnames';
import './Chip.css';

type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function Chip({ label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn('chip', { active })}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
