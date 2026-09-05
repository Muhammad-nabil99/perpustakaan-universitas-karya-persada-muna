import type { LucideIcon } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

/** Visual tone of the confirm button + icon badge. */
export type ConfirmTone = 'emerald' | 'amber' | 'red';

const TONE: Record<
    ConfirmTone,
    { badge: string; icon: string; button: string }
> = {
    emerald: {
        badge: 'bg-emerald-100 dark:bg-emerald-950/50',
        icon: 'text-emerald-600 dark:text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500/40',
    },
    amber: {
        badge: 'bg-amber-100 dark:bg-amber-950/50',
        icon: 'text-amber-600 dark:text-amber-400',
        button: 'bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-500/40',
    },
    red: {
        badge: 'bg-red-100 dark:bg-red-950/50',
        icon: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-500/40',
    },
};

export type ConfirmActionState = {
    icon: LucideIcon;
    tone: ConfirmTone;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
};

type Props = {
    /** The pending action, or null when the modal is closed. */
    action: ConfirmActionState | null;
    onOpenChange: (open: boolean) => void;
};

/**
 * A theme-aware confirmation dialog for moderation actions (approve / archive /
 * delete). Replaces the native window.confirm() with an accessible, styled
 * modal that adapts its accent colour to the action's severity.
 */
export default function ConfirmActionModal({ action, onOpenChange }: Props) {
    const tone = action ? TONE[action.tone] : TONE.red;
    const Icon = action?.icon;

    return (
        <Dialog open={action !== null} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-md gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
            >
                <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6 text-center">
                    {Icon && (
                        <span
                            className={`flex size-14 items-center justify-center rounded-full ${tone.badge}`}
                        >
                            <Icon className={`size-7 ${tone.icon}`} />
                        </span>
                    )}

                    <DialogHeader className="items-center gap-1.5 space-y-0 text-center sm:text-center">
                        <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                            {action?.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {action?.description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="gap-2 border-t border-neutral-100 bg-neutral-50 px-6 py-4 sm:justify-center dark:border-neutral-800 dark:bg-neutral-900/60">
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-400/40 focus-visible:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                            Batal
                        </button>
                    </DialogClose>

                    <button
                        type="button"
                        onClick={() => {
                            action?.onConfirm();
                            onOpenChange(false);
                        }}
                        className={`inline-flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${tone.button}`}
                    >
                        {action?.confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
