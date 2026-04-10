"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkoutDates, setCheckoutDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('연동 확인 중...');

  useEffect(() => {
    async function fetchCalendar() {
      try {
        // 방금 만든 내부 API 통로로 데이터를 가져옵니다
        const response = await fetch('/api/calendar');
        const icsText = await response.text();
        
        const dates: string[] = [];
        const lines = icsText.split(/\r?\n/);
        lines.forEach((line) => {
          if (line.includes('DTEND')) {
            const match = line.match(/\d{8}/);
            if (match) {
              const s = match[0];
              dates.push(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
            }
          }
        });
        setCheckoutDates(dates);
        setStatus(dates.length > 0 ? "실시간 연동 완료" : "업데이트 완료");
      } catch (e) {
        setStatus("연동 일시 오류");
      }
    }
    fetchCalendar();
  }, []);

  const isCheckoutDay = (day: number) => {
    const target = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkoutDates.includes(target);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-10">
      <div className="bg-orange-600 text-white p-8 rounded-b-[40px] shadow-lg text-center">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}><ChevronLeft size={30} /></button>
          <h2 className="text-3xl font-bold">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}><ChevronRight size={30} /></button>
        </div>
        <p className="text-orange-200 text-xs font-bold uppercase">{status}</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-gray-400">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
            const checkout = isCheckoutDay(day);
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(`${currentMonth.getMonth()+1}월 ${day}일`)}
                className={`relative h-14 flex items-center justify-center rounded-2xl shadow-sm text-lg font-bold ${checkout ? 'bg-orange-500 text-white scale-105 z-10' : 'bg-white text-gray-700'}`}
              >
                <div className="flex flex-col items-center">
                  <span>{day}</span>
                  {checkout && <span className="text-[7px] font-black leading-none mt-1">CHECKOUT</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full rounded-t-[30px] p-8 pb-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedDate} 메모</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400"><X size={28}/></button>
            </div>
            <p className="text-sm font-bold text-orange-600 mb-2">혜빈님께 전달드립니다</p>
            <textarea 
              className="w-full h-40 p-4 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 text-lg" 
              placeholder="여기에 내용을 입력해주세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl mt-4 text-xl shadow-lg">저장하기</button>
          </div>
        </div>
      )}
    </div>
  );
}