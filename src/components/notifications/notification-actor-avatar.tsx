import { avatarPaletteForName, getInitialsFromName } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";

type NotificationActorAvatarProps = {
  name?: string | null;
  src?: string | null;
  className?: string;
};

export function NotificationActorAvatar({
  name,
  src,
  className,
}: NotificationActorAvatarProps) {
  const displayName = name?.trim() || "Team member";
  const initials = getInitialsFromName(displayName);
  const palette = avatarPaletteForName(displayName);

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed",
        palette.border,
        palette.bg,
        !src && palette.text,
        className,
      )}
      aria-hidden={!src}
    >
      {src ? (
        <img src={src} alt={displayName} className="size-full object-cover" />
      ) : (
        <span className="text-[11px] font-bold leading-none">{initials}</span>
      )}
    </div>
  );
}
