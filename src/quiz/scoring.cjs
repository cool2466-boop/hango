'use strict';

// TOPIK I: 듣기 100 + 읽기 100 = 200점. 1급 커트라인 80, 2급 커트라인 140.
// 이 진단은 읽기형 문항만 사용하므로, 읽기 정답률을 총점으로 외삽한 "추정치"다.
// 프론트에 반드시 추정임을 명시할 것.

const LEVEL2_CUT = 140;
const LEVEL1_CUT = 80;

function score(rawScore, totalQuestions) {
  const ratio = totalQuestions > 0 ? rawScore / totalQuestions : 0;
  const projectedReading = Math.round(ratio * 100);
  const projectedTotal = projectedReading * 2; // 듣기도 비슷하다고 가정한 외삽
  let band = 'below1';
  if (projectedTotal >= LEVEL2_CUT) band = 'level2';
  else if (projectedTotal >= LEVEL1_CUT) band = 'level1';
  const gapTo2 = Math.max(0, LEVEL2_CUT - projectedTotal);
  return { projectedReading, projectedTotal, band, gapTo2 };
}

module.exports = { score, LEVEL2_CUT, LEVEL1_CUT };
