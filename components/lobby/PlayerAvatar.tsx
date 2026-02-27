'use client';

interface PlayerAvatarProps {
  name: string;
  teamColor: string;
  connected: boolean;
  size?: number;
}

export default function PlayerAvatar({
  name,
  teamColor,
  connected,
  size = 32,
}: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded font-bold text-white relative"
      style={{
        width: size,
        height: size,
        backgroundColor: teamColor,
        fontSize: size * 0.45,
        opacity: connected ? 1 : 0.4,
        imageRendering: 'pixelated',
      }}
    >
      {initial}
      {!connected && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-neutral-500 border border-neutral-800"
          title="Disconnected"
        />
      )}
    </div>
  );
}
