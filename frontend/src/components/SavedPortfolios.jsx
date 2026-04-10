export default function SavedPortfolios({ items, onToggle, onDelete }) {
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 mb-2">저장된 포트폴리오</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl cursor-pointer transition-all select-none group ${
              item.visible
                ? "bg-white border-2 shadow-sm"
                : "bg-gray-50 border-2 border-transparent opacity-50"
            }`}
            style={{
              borderColor: item.visible ? item.color : "transparent",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-medium text-gray-700 max-w-[200px] truncate">
              {item.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-[#F04452] opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
