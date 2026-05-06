const express = require('express');
const app = express();

app.use(express.json());

// 기준 조
const base = [5, 1, 2, 3, 4];

// 수요일 기준 시작일
const startDate = new Date("2026-04-29"); // 수요일

// 🔵 수요일 기준 주차 계산
function getWeekNumber(date) {
  const d = new Date(date);

  const day = d.getDay(); // 0~6

  // 가장 가까운 이전 수요일로 이동
  const diffToWednesday = (day >= 3) ? day - 3 : day + 4;
  d.setDate(d.getDate() - diffToWednesday);

  const diff = d - startDate;

  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

// 오른쪽 회전
function rotateRight(arr, n) {
  const len = arr.length;

  // NaN / 음수 / 큰 값 방지
  const shift = ((n % len) + len) % len;

  return arr.slice(-shift).concat(arr.slice(0, -shift));
}

// 🔥 스케줄 생성
function getSchedule(week) {
  const safeWeek = ((week % 5) + 5) % 5; // 안정화

  const r = rotateRight(base, safeWeek);

  return {
    lab: `${r[0]}조`,
    outdoor: `${r[1]}조`,
    tzone: `${r[2]}조, ${r[3]}조`,
    classroom: `${r[4]}조`
  };
}

// 출력 포맷
function makeText(title, s) {
  return `🧹 ${title}

실습실: ${s.lab}
실외 실습실: ${s.outdoor}
실습실 T자: ${s.tzone}
강의실: ${s.classroom}

더 궁금한 점이 있으신가요? 😊`;
}

// API
app.post('/cleaning', (req, res) => {
  const msg = req.body?.userRequest?.utterance || "";

  const now = new Date();
  const week = getWeekNumber(now);

  // 디버깅용 (문제 있을 때 확인)
  console.log("week:", week);

  let schedule, title;

  if (msg.includes("다음")) {
    schedule = getSchedule(week + 1);
    title = "다음 주 청소 구역";
  } else {
    schedule = getSchedule(week);
    title = "이번 주 청소 구역";
  }

  res.json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: makeText(title, schedule)
          }
        }
      ],
      quickReplies: [
        {
          label: "🔙 뒤로",
          action: "block",
          blockId: "69f347dcf7e56499190b9a1e"
        },
        {
          label: "🏠 처음으로",
          action: "block",
          blockId: "69f34838f3d5017cd0310894"
        }
      ]
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port);
