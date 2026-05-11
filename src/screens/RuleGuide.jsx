import { useState } from 'react';
import { colors, fonts, paperBg } from '../utils/theme';
import MouseAvatar from '../components/MouseAvatar';

// 룰 설명 모드 (방장이 친구들에게 보여주는 슬라이드)
export default function RuleGuide({ room, onClose }) {
  const includeTroll = !!room?.options?.includeTroll;
  const pages = buildPages(includeTroll);
  const [page, setPage] = useState(0);
  const total = pages.length;

  function prev() {
    if (page > 0) setPage(page - 1);
  }
  function next() {
    if (page < total - 1) setPage(page + 1);
  }

  const current = pages[page];

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {current.render({
        page,
        total,
        onPrev: prev,
        onNext: next,
        onClose,
      })}
    </div>
  );
}

function buildPages(includeTroll) {
  const pages = [
    { render: CoverPage },
    { render: FlowPage },
    { render: SleepyheadPage },
    { render: ThiefPage },
  ];
  if (includeTroll) pages.push({ render: TrollPage });
  pages.push(
    { render: DicePage },
    { render: NightPage },
    { render: StealPage },
    { render: DayPage },
    { render: ReadyPage }
  );
  return pages;
}

function PageFrame({ children, page, total, onPrev, onNext, onClose, bg = paperBg, isLast = false, dark = false }) {
  return (
    <div
      style={{
        height: '100%',
        ...bg,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      <div style={{ paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === page ? colors.cheese : dark ? colors.midnightBorder : '#E8DDC0',
              }}
            />
          ))}
        </div>
        {isLast ? (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: '#5C4A2A',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              color: colors.cheeseLight,
              fontFamily: fonts.body,
            }}
          >
            설명 닫기 ✕
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onPrev}
              disabled={page === 0}
              style={{
                flex: 1,
                padding: '10px',
                background: dark ? colors.midnightLight : colors.paper,
                border: `0.5px solid ${dark ? colors.midnightBorder : colors.hint}`,
                borderRadius: 10,
                fontSize: 12,
                color: dark ? colors.midnightText : colors.ink,
                fontFamily: fonts.body,
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              ← 이전
            </button>
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '10px',
                background: colors.cheese,
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: colors.ink,
                fontFamily: fonts.body,
              }}
            >
              다음 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CoverPage(props) {
  return (
    <PageFrame {...props}>
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: colors.muted }}>RULE GUIDE</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.ink, marginTop: 14, lineHeight: 1.3, fontFamily: fonts.display }}>
          누가 치즈를<br />훔쳤을까?
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <BigCheeseSimple size={120} />
        </div>
        <div style={{ marginTop: 28, fontSize: 12, color: colors.muted, lineHeight: 1.7, fontStyle: 'italic' }}>
          "매일 밤, 치즈가<br />사라지고 있어요...<br />누가 훔쳐가는 걸까요?"
        </div>
      </div>
    </PageFrame>
  );
}

function FlowPage(props) {
  return (
    <PageFrame {...props}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>02 · GAME FLOW</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 8, fontFamily: fonts.display }}>게임의 흐름</div>
      </div>
      <div style={{ padding: '20px 12px' }}>
        <div style={{ padding: 14, background: colors.midnight, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 28 }}>🌙</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.cheese }}>밤</div>
            <div style={{ fontSize: 11, color: colors.midnightText, marginTop: 2 }}>1시~6시 차례로 깨어나 행동</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 16, color: colors.hint, lineHeight: 1, padding: '6px 0' }}>↓</div>
        <div style={{ padding: 14, background: `linear-gradient(135deg, ${colors.cheeseLight}, ${colors.cheese})`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>☀️</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink }}>낮</div>
            <div style={{ fontSize: 11, color: colors.ink, marginTop: 2, opacity: 0.8 }}>토론하고 도둑 지목!</div>
          </div>
        </div>
      </div>
      <div style={{ margin: '16px 12px 0', padding: 14, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink, textAlign: 'center', marginBottom: 8 }}>📋 알아둘 것</div>
        <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.7 }}>
          • 각자 새벽 1~6시 중 한 시간에 깨요<br />
          • 도둑은 자기 시간에 치즈를 훔쳐요<br />
          • 모두 자기 차례 외엔 눈 감기!
        </div>
      </div>
    </PageFrame>
  );
}

function SleepyheadPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, #F4F0E0 0%, ${colors.cream} 100%)` }}>
      <div style={{ paddingTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>ROLE</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 6, fontFamily: fonts.display }}>잠꾸러기</div>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(156, 175, 136, 0.25)', borderRadius: 10, marginTop: 6 }}>
          <div style={{ fontSize: 10, color: colors.sageDark }}>🟢 시민팀 · 대다수</div>
        </div>
      </div>
      <div style={{ margin: '16px 12px 0', padding: 16, background: colors.paper, border: `1.5px solid ${colors.sage}`, borderRadius: 14, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MouseAvatar size={88} color={colors.avatarColors[0]} role="sleepyhead" />
        </div>
        <div style={{ fontSize: 12, color: colors.ink, fontWeight: 700, marginTop: 8 }}>평화로운 잠꾸러기</div>
      </div>
      <div style={{ margin: '12px 12px 0', padding: 12, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.ink, marginBottom: 6 }}>🎯 할 일</div>
        <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.7 }}>
          • 자기 시간에 혼자 깼다면 옆 사람 컵을 한 번 들춰볼 수 있어요<br />
          • 누군가와 같이 깼다면 미소만~<br />
          • 낮에 도둑이 누군지 추리해서 지목!
        </div>
      </div>
      <div style={{ margin: '10px 12px 0', padding: 10, background: 'rgba(156, 175, 136, 0.15)', borderRadius: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.ink }}>🏆 승리 조건</div>
        <div style={{ fontSize: 10, color: colors.sageDark, marginTop: 4 }}>진짜 도둑을 지목해내면 승리!</div>
      </div>
    </PageFrame>
  );
}

function ThiefPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, ${colors.midnightLight} 0%, ${colors.midnight} 100%)` }} dark>
      <div style={{ paddingTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.midnightText }}>ROLE</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.cheese, marginTop: 6, fontFamily: fonts.display }}>치즈 도둑</div>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(244, 208, 111, 0.2)', borderRadius: 10, marginTop: 6 }}>
          <div style={{ fontSize: 10, color: colors.cheese }}>🟡 도둑팀 · 1명</div>
        </div>
      </div>
      <div style={{ margin: '16px 12px 0', padding: 16, background: colors.midnightLight, border: `1.5px solid ${colors.cheese}`, borderRadius: 14, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MouseAvatar size={88} color={colors.thief} role="thief" />
        </div>
        <div style={{ fontSize: 12, color: colors.cheese, fontWeight: 700, marginTop: 8 }}>은밀한 치즈 도둑</div>
      </div>
      <div style={{ margin: '12px 12px 0', padding: 12, background: 'rgba(244, 208, 111, 0.1)', borderRadius: 12, border: `0.5px solid ${colors.midnightBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.cheese, marginBottom: 6 }}>🎯 할 일</div>
        <div style={{ fontSize: 10, color: colors.midnightText, lineHeight: 1.7 }}>
          • 내 시간에 깨어나면 치즈를 살며시!<br />
          • 같이 깬 잠꾸러기 1명을 공범으로 (손가락 가리키기)<br />
          • 낮에 들키지 않게 시치미떼기
        </div>
      </div>
      <div style={{ margin: '10px 12px 0', padding: 10, background: 'rgba(244, 208, 111, 0.15)', borderRadius: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.cheese }}>🏆 승리 조건</div>
        <div style={{ fontSize: 10, color: colors.midnightText, marginTop: 4, lineHeight: 1.5 }}>
          엉뚱한 쥐가 지목되면 승리!<br />(공범도 함께 승리)
        </div>
      </div>
    </PageFrame>
  );
}

function TrollPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, #FFE5F0 0%, ${colors.cream} 100%)` }}>
      <div style={{ paddingTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>ROLE</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.troll, marginTop: 6, fontFamily: fonts.display }}>트롤 쥐</div>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(199, 62, 92, 0.15)', borderRadius: 10, marginTop: 6 }}>
          <div style={{ fontSize: 10, color: colors.troll }}>🔴 단독팀 · 옵션</div>
        </div>
      </div>
      <div style={{ margin: '14px 12px 0', padding: 16, background: colors.paper, border: `1.5px solid ${colors.troll}`, borderRadius: 14, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MouseAvatar size={88} color={colors.avatarColors[1]} role="troll" />
        </div>
        <div style={{ fontSize: 12, color: colors.ink, fontWeight: 700, marginTop: 8 }}>장난꾸러기 트롤 쥐</div>
      </div>
      <div style={{ margin: '10px 12px 0', padding: 12, background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.ink, marginBottom: 4 }}>🎯 할 일</div>
        <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.7 }}>
          • 잠꾸러기와 똑같이 행동<br />
          • 일부러 의심을 내게 끌어!
        </div>
      </div>
      <div style={{ margin: '8px 12px 0', padding: 10, background: 'rgba(199, 62, 92, 0.1)', borderRadius: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.troll }}>🏆 승리 조건</div>
        <div style={{ fontSize: 10, color: colors.cheeseDark, marginTop: 4 }}>내가 도둑으로 지목당하면 단독 승리!</div>
      </div>
    </PageFrame>
  );
}

function DicePage(props) {
  return (
    <PageFrame {...props}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>SETUP</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 6, fontFamily: fonts.display }}>주사위를 굴려요</div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>언제 깨어날지 정해져요</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <div
          style={{
            width: 110,
            height: 110,
            background: '#F4F0E0',
            border: `2px solid ${colors.ink}`,
            borderRadius: 16,
            boxShadow: '3px 3px 0 #C9B98A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 8, width: 70, height: 70 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors.ink, alignSelf: 'start', justifySelf: 'start' }} />
            <div />
            <div />
            <div />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors.ink, alignSelf: 'center', justifySelf: 'center' }} />
            <div />
            <div />
            <div />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors.ink, alignSelf: 'end', justifySelf: 'end' }} />
          </div>
        </div>
      </div>
      <div style={{ margin: '20px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            style={{
              aspectRatio: '1',
              background: n === 3 ? colors.cheese : colors.paper,
              border: `0.5px solid ${n === 3 ? colors.cheeseDark : colors.hint}`,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: n === 3 ? 13 : 11,
              fontWeight: 700,
              color: colors.ink,
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: colors.muted, textAlign: 'center', marginTop: 6 }}>새벽 1시 ~ 6시</div>
      <div style={{ margin: '16px 12px 0', padding: 12, background: colors.paper, borderRadius: 10, border: `0.5px solid ${colors.hint}` }}>
        <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.7 }}>
          • 나온 숫자가 <strong style={{ color: colors.ink }}>내 시간</strong>이에요<br />
          • 절대 다른 사람에게 보여주지 마세요!<br />
          • 본인 머릿속에만 기억
        </div>
      </div>
    </PageFrame>
  );
}

function NightPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, ${colors.midnight} 0%, ${colors.midnightDeep} 100%)` }} dark>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.midnightText }}>NIGHT</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.cheese, marginTop: 6, fontFamily: fonts.display }}>밤이 깊어가요</div>
        <div style={{ fontSize: 11, color: colors.midnightText, marginTop: 4 }}>차례대로 깨어나요</div>
      </div>
      <div style={{ padding: '18px 16px 0' }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              background: n === 3 ? colors.cheese : colors.midnightLight,
              borderRadius: 7,
              marginBottom: 5,
              opacity: n > 3 ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: n === 3 ? colors.ink : colors.midnightBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: n === 3 ? colors.cheese : colors.cheese,
              }}
            >
              {n}
            </div>
            <div style={{ fontSize: 11, color: n === 3 ? colors.ink : colors.midnightText, fontWeight: n === 3 ? 700 : 400 }}>
              {n}시에 {n <= 3 ? '깬' : '깰'} 쥐 {n === 3 ? '← 지금!' : ''}
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin: '14px 12px 0', padding: 12, background: 'rgba(244, 208, 111, 0.1)', borderRadius: 10, border: `0.5px solid ${colors.midnightBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.cheese, marginBottom: 4 }}>💡 혼자 깼다면</div>
        <div style={{ fontSize: 10, color: colors.midnightText, lineHeight: 1.5 }}>
          옆 사람 폰을 두 번 탭해서<br />주사위를 한 번 들춰볼 수 있어요
        </div>
      </div>
    </PageFrame>
  );
}

function StealPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, ${colors.midnightLight} 0%, ${colors.midnight} 100%)` }} dark>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.midnightText }}>THIEF</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.cheese, marginTop: 6, fontFamily: fonts.display }}>도둑의 차례</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
        <svg width="120" height="100" viewBox="0 0 120 100">
          <ellipse cx="60" cy="85" rx="42" ry="7" fill="#000" opacity="0.3" />
          <ellipse cx="60" cy="80" rx="42" ry="9" fill="#5A4628" />
          <path d="M22 75 L98 75 L104 35 L16 35 Z" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="1.5" />
          <path d="M22 75 L98 75 L98 82 L22 82 Z" fill="#D4A847" stroke={colors.cheeseDark} strokeWidth="1.5" />
          <circle cx="60" cy="55" r="22" fill="none" stroke={colors.cheese} strokeWidth="1.5" opacity="0.5" />
          <g transform="translate(60, 30)">
            <rect x="-5" y="-25" width="10" height="30" rx="5" fill="#E8B5A0" stroke="#8B6940" strokeWidth="1" />
          </g>
        </svg>
      </div>
      <div style={{ margin: '8px 12px 0', padding: 12, background: 'rgba(244, 208, 111, 0.1)', borderRadius: 10, border: `0.5px solid ${colors.midnightBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.cheese, marginBottom: 4 }}>🧀 치즈 훔치기</div>
        <div style={{ fontSize: 10, color: colors.midnightText, lineHeight: 1.5 }}>
          자기 시간에 깨면 가운데 치즈를<br />살며시 탭하세요
        </div>
      </div>
      <div style={{ margin: '10px 12px 0', padding: 12, background: 'rgba(244, 208, 111, 0.1)', borderRadius: 10, border: `0.5px solid ${colors.midnightBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.cheese, marginBottom: 4 }}>👉 공범 만들기</div>
        <div style={{ fontSize: 10, color: colors.midnightText, lineHeight: 1.5 }}>
          같이 깬 잠꾸러기가 있다면<br />한 명을 손가락으로 가리키세요
        </div>
      </div>
    </PageFrame>
  );
}

function DayPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, ${colors.cheeseLight} 0%, ${colors.cream} 100%)` }}>
      <div style={{ paddingTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: colors.muted }}>DAY</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginTop: 6, fontFamily: fonts.display }}>아침이 밝았어요</div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>치즈가 사라졌어요!</div>
      </div>
      <div style={{ padding: '16px 12px 0' }}>
        <div style={{ padding: 12, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}`, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 24, height: 24, background: colors.cheese, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💬</div>
            <div style={{ fontSize: 11, color: colors.ink, fontWeight: 700 }}>토론 (3분)</div>
          </div>
          <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
            본 것을 말해도 되고<br />거짓말을 해도 됩니다!
          </div>
        </div>
        <div style={{ padding: 12, background: colors.paper, borderRadius: 12, border: `0.5px solid ${colors.hint}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 24, height: 24, background: colors.cheese, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👉</div>
            <div style={{ fontSize: 11, color: colors.ink, fontWeight: 700 }}>투표</div>
          </div>
          <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
            "하나, 둘, 셋!" 외치면<br />도둑이라고 생각하는 쥐를<br />손가락으로 가리켜요
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function ReadyPage(props) {
  return (
    <PageFrame {...props} bg={{ background: `linear-gradient(180deg, ${colors.cheese} 0%, ${colors.cheeseLight} 100%)` }} isLast>
      <div style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: colors.ink, opacity: 0.7 }}>LET'S PLAY</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: colors.ink, marginTop: 14, lineHeight: 1.3, fontFamily: fonts.display }}>
          준비됐나요?
        </div>
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <BigCheeseSimple size={130} />
        </div>
        <div style={{ marginTop: 24, fontSize: 13, color: colors.ink, fontStyle: 'italic', opacity: 0.85, lineHeight: 1.7 }}>
          "이제 진짜 도둑을<br />찾으러 가볼까요?"
        </div>
      </div>
    </PageFrame>
  );
}

function BigCheeseSimple({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 160 140" style={{ display: 'block' }}>
      <ellipse cx="80" cy="125" rx="55" ry="7" fill="#000" opacity="0.15" />
      <ellipse cx="80" cy="120" rx="55" ry="9" fill="#8B6940" />
      <path d="M30 115 L130 115 L138 60 L22 60 Z" fill={colors.cheese} stroke={colors.cheeseDark} strokeWidth="2" />
      <path d="M30 115 L130 115 L130 122 L30 122 Z" fill="#D4A847" stroke={colors.cheeseDark} strokeWidth="2" />
      <ellipse cx="52" cy="85" rx="7" ry="5" fill={colors.cheeseDark} />
      <ellipse cx="90" cy="78" rx="6" ry="5" fill={colors.cheeseDark} />
      <ellipse cx="112" cy="92" rx="6" ry="5" fill={colors.cheeseDark} />
    </svg>
  );
}
