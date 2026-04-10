"use client";
import React, { useEffect, useState, useCallback } from 'react';

export default function CalendarApp() {
  const [allReservations, setAllReservations] = useState<{y:number, m:number, d:number}[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); 
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [mounted, setMounted] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.reservations) setAllReservations(data.reservations);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
    const savedMemo = localStorage.getItem(`memo-${year}-${month + 1}-${date}`);
    setMemo(savedMemo || '');
  };

  const handleMemoChange = (val: string) => {
    setMemo(val);
    if (selectedDate) {
      localStorage.setItem(`memo-${year}-${month + 1}-${selectedDate}`, val);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white p-4 font-sans text-gray-900 pb-20">
      <div className="max-w-full mx-auto bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <header className="bg-orange-500 p-4 text-white text-center">
          <div className="flex justify-between items-center max-w-xs mx-auto mb-1">
            <button onClick={() => {setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null);}} className="p-2 text-xl font-bold">〈</button>
            <h1 className="text-xl font-black italic">{year}년 {month + 1}월</h1>
            <button onClick={() => {setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null);}} className="p-2 text-xl font-bold">〉</button>
          </div>
          <p className="text-[10px] font-black opacity-80 uppercase tracking-tighter">Firstay 1000 Cleaning System</p>
        </header>

        <div className="p-2">
          <div className="grid grid-cols-7 mb-4 text-center text-[10px] font-bold text-gray-400">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div key={d} className={i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptySlots.map(i => <div key={`empty-${i}`} className="h-24 bg-gray-50/30 rounded-xl"></div>)}
            {days.map(date => {
              const isReserved = allReservations.some(r => r.y === year && r.m === (month + 1) && r.d === date);
              const hasMemo = localStorage.getItem(`memo-${year}-${month + 1}-${date}`);
              const isSelected = selectedDate === date;

              return (
                <div 
                  key={date} 
                  onClick={() => handleDateClick(date)}
                  className={`h-24 rounded-xl border transition-all cursor-pointer p-2 flex flex-col justify-between ${
                    isSelected ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold ${isReserved ? 'text-orange-500' : 'text-gray-400'}`}>{date}</span>
                    {hasMemo && <span className="text-[10px]">📝</span>}
                  </div>
                  
                  {isReserved && (
                    <div className="bg-orange-500 rounded-lg py-2 shadow-sm">
                      <p className="text-white text-[11px] font-black text-center">체크아웃</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm relative">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-black text-orange-900">📍 {month + 1}월 {selectedDate}일 메모</h2>
                <button onClick={() => setSelectedDate(null)} className="text-gray-400 text-lg p-1">✕</button>
              </div>
              <textarea 
                autoFocus
                value={memo} 
                onChange={(e) => handleMemoChange(e.target.value)}
                className="w-full h-24 p-3 bg-white rounded-xl border-none shadow-inner text-sm outline-none text-black" 
                placeholder="혜빈님께 공유드립니다" 
              />
              <p className="text-[9px] text-orange-300 mt-1 text-right">자동 저장 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}