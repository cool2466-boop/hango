'use strict';

/*
 * 문항 세트 레지스트리.
 *
 * 출처 정책:
 *  - 기본 제공 세트(diagnostic-01)는 TOPIK I 유형을 참고해 자체 창작한 문항이다 (저작권 안전).
 *  - "공개 기출" 세트를 추가하려면 src/quiz/sets/eps-<회차>.cjs 형태로 파일을 만들고
 *    아래 registry 에 등록한다. 재배포 이용약관을 반드시 먼저 확인할 것:
 *      * EPS-TOPIK 공개문제집(한국산업인력공단) — 학습 목적 공개, 가장 안전
 *      * TOPIK 기출문제(국립국제교육원) — 공개 회차라도 재배포 조건 확인 필요
 *  - 한 세션은 한 세트를 통째로 풀며, 여러 회차를 "다시 풀기"로 순환할 수 있게 설계.
 */

const diagnostic01 = require('./sets/diagnostic-01.cjs');

const registry = {
  'diagnostic-01': diagnostic01,
  // 'eps-64': require('./sets/eps-64.cjs'),
};

const order = ['diagnostic-01'];

function listSets() {
  return order.map((id) => ({
    id,
    title: registry[id].title,
    source: registry[id].source,
    level: registry[id].level,
    count: registry[id].questions.length,
  }));
}

function getSet(id) {
  return registry[id] || null;
}

// 클라이언트로 내려줄 때 정답(answer)은 제거
function publicSet(id) {
  const set = getSet(id);
  if (!set) return null;
  return {
    id,
    title: set.title,
    level: set.level,
    questions: set.questions.map((q, i) => ({
      no: i + 1,
      passage: q.passage || null,
      prompt: q.prompt,
      choices: q.choices,
    })),
  };
}

function nextSetId(currentId) {
  const idx = order.indexOf(currentId);
  return order[(idx + 1) % order.length];
}

module.exports = { listSets, getSet, publicSet, nextSetId, order };
