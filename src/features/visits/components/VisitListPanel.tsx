function VisitListPanel() {
  function handleCreateVisitClick() {
    alert('버튼을 클릭했습니다!')
  }

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-700">방문 기록</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">
            방문한 곳
          </h1>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          0곳
        </span>
      </div>

      <button
        className="mt-6 h-11 w-full cursor-pointer rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
        onClick={handleCreateVisitClick}
        type="button"
      >
        + 새 방문지 추가
      </button>

      <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-stone-800">
          아직 등록된 방문지가 없습니다.
        </p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          방문지 생성 기능을 추가하면 이곳에 기록 목록이 표시됩니다.
        </p>
      </div>
    </aside>
  )
}

export default VisitListPanel
