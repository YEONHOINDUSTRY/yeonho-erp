"use client";

import { useState } from "react";

const parts = [
  { car: "CN7", partNo: "65852-BY000", name: "CTR CROSS" },
  { car: "SG2", partNo: "65852-AT000", name: "CTR CROSS" },
  { car: "SU2i SWB", partNo: "50011444C", name: "GLASS REINF FRT" },
  { car: "SU2i SWB", partNo: "50011449C", name: "GLASS REINF RR" },
  { car: "SU2i LWB", partNo: "50012088B", name: "GLASS REINF FRT" },
  { car: "SU2i LWB", partNo: "50012093B", name: "GLASS REINF RR" },
  { car: "SV", partNo: "76271-EV000", name: "REINF-FR,DR HINGE FACE,LH" },
  { car: "SV", partNo: "76281-EV000", name: "REINF-FR,DR HINGE FACE,RH" },
  { car: "GN7", partNo: "69213-N1000", name: "PNL-TRUNK LID OTR LWR" },
  { car: "GN7 PE", partNo: "67134-N1550", name: "RAIL-ROOF RR LWR" },
];

export default function ProductionPage() {
  const [partNo, setPartNo] = useState("");
  const selectedPart = parts.find((p) => p.partNo === partNo);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-800">생산일보 입력</h1>
          <p className="text-slate-500 mt-2">
            품번을 선택하면 차종과 품명이 자동 표시됩니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">작업일자</label>
              <input type="date" className="w-full border rounded-xl p-3" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">근무구분</label>
              <select className="w-full border rounded-xl p-3">
                <option>주간</option>
                <option>야간</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">품번</label>
              <select
                className="w-full border rounded-xl p-3"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
              >
                <option value="">품번 선택</option>
                {parts.map((part) => (
                  <option key={part.partNo} value={part.partNo}>
                    {part.partNo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">생산수량</label>
              <input
                type="number"
                className="w-full border rounded-xl p-3"
                placeholder="수량 입력"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">차종</label>
              <div className="w-full border rounded-xl p-3 bg-slate-50">
                {selectedPart?.car || "-"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">품명</label>
              <div className="w-full border rounded-xl p-3 bg-slate-50">
                {selectedPart?.name || "-"}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">비고</label>
            <textarea
              className="w-full border rounded-xl p-3 h-28"
              placeholder="특이사항 입력"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-3 rounded-xl bg-slate-200 font-bold">
              취소
            </button>
            <button className="px-6 py-3 rounded-xl bg-blue-700 text-white font-bold">
              저장
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}