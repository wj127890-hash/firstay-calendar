"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// 보내주신 정확한 주소로 설정했습니다!
const AIRBNB_ICAL_URL = "https://www.airbnb.co.kr/calendar/ical/1449092803394676993.ics?t=ae54c99940fb41e998f0b0b30f34e0ea";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkoutDates, setCheckoutDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(AIRBNB_ICAL_URL)}`);
        const data = await response.json();
        const icsText = data.contents;
        
        const dates: string[] = [];
        const lines = icsText.split(/\r?\n/);
        
        lines.forEach((line: string) => {
          if (line.includes('DTEND')) {
            const match = line.match(/\d{8}/);
            if (match) {
              const s = match[0];
              // 월과 일을 항상 2자리 숫자(04, 09 등)로 유지해서 저장합니다.
              const formattedDate = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
              dates.push(formattedDate);
            }
          }
        });
        setCheckoutDates(dates);
      } catch (e) {
        console.error("연동 실패:", e);
      }
    }
    fetchCalendar();
  }, []);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const isCheckoutDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    const target = `${year}-${month}-${date}`; // '2026-04-10' 형식으로 비교
    return checkoutDates.includes(target);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-10">
      <div className="bg-orange-600 text-white p-8 rounded-b-[40px] shadow-lg text-center">
        <div className="flex justify-between items-center mb-2">
          <button onClick={prevMonth}><ChevronLeft size={30} /></button>
          <h2 className="text-3xl font-bold">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
          <button onClick={nextMonth}><ChevronRight size={30} /></button>
        </div>
        <p className="text-orange-200 tracking-widest text-xs font-bold uppercase font-sans">Firstay 1000 Mobile</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-gray-400">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {Array(firstDayOfMonth(currentMonth)).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => {
            const checkout = isCheckoutDay(day);
            return (
              <div 
                key={day} 
                onClick={() => checkout && setSelectedDate(`${currentMonth.getMonth()+1}월 ${day}일`)}
                className={`relative h-14 flex items-center justify-center rounded-2xl shadow-sm text-lg font-bold transition-all ${checkout ? 'bg-orange-500 text-white scale-105 z-10' : 'bg-white text-gray-700'}`}
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
          <div className="bg-white w-full rounded-t-[30px] p-8 pb-12 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{selectedDate} 메모</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400"><X size={28}/></button>
            </div>
            <textarea className="w-full h-40 p-4 border-2 border-orange-100 rounded-2xl outline-none focus:border-orange-500 text-lg" placeholder="혜빈님께 전달드립니다" />
            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl mt-4 text-xl shadow-lg">저장하기</button>
          </div>
        </div>
      )}
    </div>
  );
}