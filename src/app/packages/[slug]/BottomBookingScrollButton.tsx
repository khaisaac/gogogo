"use client";

type BottomBookingScrollButtonProps = {
  targetId: string;
  className: string;
};

export default function BottomBookingScrollButton({
  targetId,
  className,
}: BottomBookingScrollButtonProps) {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 88;
    const elementY = target.getBoundingClientRect().top + window.scrollY;
    const targetY = Math.max(0, elementY - headerOffset);

    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      Choose Your Package
    </button>
  );
}
