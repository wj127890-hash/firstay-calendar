// app/api/calendar/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const AIRBNB_URL = "https://www.airbnb.co.kr/calendar/ical/1449092803394676993.ics?t=ae54c99940fb41e998f0b0b30f34e0ea";
  
  try {
    // 서버가 직접 에어비앤비에 접속해서 데이터를 가져옵니다 (보안 통과!)
    const response = await fetch(AIRBNB_URL, { cache: 'no-store' });
    const data = await response.text();
    return new NextResponse(data);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}