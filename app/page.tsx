export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            YEONHO ERP
          </h1>
          <p className="text-slate-500 mt-2">
            연호산업 통합 생산관리 시스템
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-slate-500">이번달 생산수량</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              0 EA
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-slate-500">비가동 시간</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              0 HR
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-slate-500">예상 도급금액</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              ₩0
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-slate-500">입력 누락</div>
            <div className="text-3xl font-bold text-orange-500 mt-2">
              0건
            </div>
          </div>

        </div>

        <div className="grid grid-cols-3 gap-6">

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              생산일보
            </h2>
            <p className="text-slate-500 mt-2">
              생산수량 입력
            </p>
          </button>

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              비가동관리
            </h2>
            <p className="text-slate-500 mt-2">
              설비 / 금형 / 소재
            </p>
          </button>

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              도급정산
            </h2>
            <p className="text-slate-500 mt-2">
              월 정산 자동집계
            </p>
          </button>

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              근태관리
            </h2>
            <p className="text-slate-500 mt-2">
              QR 출퇴근 연동
            </p>
          </button>

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              안전교육
            </h2>
            <p className="text-slate-500 mt-2">
              법정교육 관리
            </p>
          </button>

          <button className="bg-white rounded-2xl shadow p-10 text-left hover:bg-blue-50">
            <h2 className="text-2xl font-bold">
              협상센터
            </h2>
            <p className="text-slate-500 mt-2">
              생산·비가동 분석
            </p>
          </button>

        </div>

      </div>
    </main>
  );
}