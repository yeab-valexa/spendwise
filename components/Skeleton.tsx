export default function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="sk sk-emoji" />
          <div className="sk-body">
            <div className="sk sk-line" />
            <div className="sk sk-line short" />
          </div>
          <div className="sk sk-amt" />
        </div>
      ))}
    </div>
  );
}
