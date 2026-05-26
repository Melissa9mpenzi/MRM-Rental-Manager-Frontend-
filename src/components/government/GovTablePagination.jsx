export default function GovTablePagination({ page = 1, totalPages = 5, onPage }) {
  const pages = [];
  const max = Math.min(totalPages, 5);
  for (let i = 1; i <= max; i += 1) pages.push(i);

  return (
    <div className="gov-pagination">
      <button
        type="button"
        className="gov-pagination__btn"
        disabled={page <= 1}
        onClick={() => onPage?.(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`gov-pagination__btn ${p === page ? "gov-pagination__btn--active" : ""}`}
          onClick={() => onPage?.(p)}
        >
          {p}
        </button>
      ))}
      {totalPages > 5 && <span className="gov-pagination__ellipsis">…</span>}
      {totalPages > 5 && (
        <button type="button" className="gov-pagination__btn" onClick={() => onPage?.(totalPages)}>
          {totalPages}
        </button>
      )}
      <button
        type="button"
        className="gov-pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onPage?.(page + 1)}
      >
        ›
      </button>
    </div>
  );
}
