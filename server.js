const express = require('express');
const app = express();

app.use(express.json());

const groups = [5,4,3,2,1];
const startDate = new Date("2026-04-27");

function getWeekNumber(date) {
  const diff = date - startDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

function rotate(arr, n) {
  return arr.slice(n).concat(arr.slice(0, n));
}

function getSchedule(week) {
  const r = rotate(groups, week % 5);

  return {
    lab: `${r[0]}조`,
    outdoor: `${r[1]}조`,
    tzone: `${r[2]}조, ${r[3]}조`,
    classroom: `${r[4]}조`
  };
}

function makeText(title, s) {
  return `🧹 ${title}

실습실: ${s.lab}
실외 실습실: ${s.outdoor}
실습실 T자: ${s.tzone}
강의실: ${s.classroom}

더 궁금한 점이 있으신가요? 😊`;
}

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
          blockId: "청소시작블록ID"   // 👉 여기 실제 블록ID 넣기
        },
        {
          label: "🏠 처음으로",
          action: "block",
          blockId: "시작블록ID"      // 👉 여기 실제 시작블록ID 넣기
        }
      ]
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port);
