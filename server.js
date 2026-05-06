const express = require('express');
const app = express();

app.use(express.json());

// ⭐ 수요일 기준 시작일 (중요)
const startDate = new Date("2026-04-29T00:00:00");

// 주차 계산
function getWeekNumber(date) {
  const diff = date - startDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

// 내림차순 순환 함수 (5→4→3→2→1→5)
function down(n, step) {
  return ((n - step - 1 + 5) % 5) + 1;
}

// T존 계산 (실외 → 강의실 사이 값 2개)
function getTzone(outdoor, classroom) {
  const result = [];
  let current = outdoor;

  while (true) {
    current = current === 1 ? 5 : current - 1;
    if (current === classroom) break;
    result.push(current);
  }

  return result;
}

// 스케줄 생성
function getSchedule(week) {
  const lab = down(5, week);        // 실습실
  const outdoor = down(1, week);    // 실외 실습실
  const classroom = down(4, week);  // 강의실

  const tzoneArr = getTzone(outdoor, classroom);

  return {
    lab: `${lab}조`,
    outdoor: `${outdoor}조`,
    tzone: `${tzoneArr[0]}조, ${tzoneArr[1]}조`,
    classroom: `${classroom}조`
  };
}

// 출력 텍스트
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

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
