import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "MVP에서는 브라우저의 ZIP 다운로드 버튼을 사용합니다. 서버 렌더 export는 다음 단계에서 Playwright로 확장하세요."
  });
}
