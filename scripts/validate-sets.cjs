'use strict';

// 모든 문항 세트 구조 검증: choices 4개, answer 인덱스 범위, 정답 위치 분포.
const { order, getSet } = require('../src/quiz/sets.cjs');

let errors = 0;
for (const id of order) {
  const set = getSet(id);
  if (!set) { console.error(`✗ ${id}: 레지스트리에 없음`); errors++; continue; }
  const dist = [0, 0, 0, 0];
  set.questions.forEach((q, i) => {
    const at = `${id} Q${i + 1}`;
    if (!Array.isArray(q.choices) || q.choices.length < 2) { console.error(`✗ ${at}: choices 오류`); errors++; }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) {
      console.error(`✗ ${at}: answer 인덱스 범위 밖 (${q.answer})`); errors++;
    }
    if (!q.prompt) { console.error(`✗ ${at}: prompt 없음`); errors++; }
    if (new Set(q.choices).size !== q.choices.length) { console.error(`✗ ${at}: 중복 보기`); errors++; }
    if (Number.isInteger(q.answer) && q.answer < 4) dist[q.answer]++;
  });
  console.log(`${errors ? ' ' : '✓'} ${id}: ${set.questions.length}문항, 정답분포 [${dist.join(', ')}]`);
}

if (errors) { console.error(`\n${errors}개 오류`); process.exit(1); }
console.log('\n모든 세트 정상');
