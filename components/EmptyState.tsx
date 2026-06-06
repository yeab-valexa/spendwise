export default function EmptyState({
  emoji,
  title,
  sub,
}: {
  emoji: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-emoji">{emoji}</span>
      <span className="empty-title">{title}</span>
      {sub && <span className="empty-sub">{sub}</span>}
    </div>
  );
}
