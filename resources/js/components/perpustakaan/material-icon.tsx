import { cn } from '@/lib/utils';

type Props = {
    /** The Material Symbols icon name, e.g. "menu_book", "search". */
    name: string;
    /** Render the filled variant of the glyph. */
    filled?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

/**
 * Renders a Google Material Symbols (Outlined) icon. The font is loaded in
 * app.blade.php and the base `.material-symbols-outlined` class lives in
 * app.css. Used across the Perpustakaan UKPM public pages.
 */
export default function MaterialIcon({ name, filled, className, style }: Props) {
    return (
        <span
            aria-hidden="true"
            className={cn('material-symbols-outlined', filled && 'fill', className)}
            style={style}
        >
            {name}
        </span>
    );
}
