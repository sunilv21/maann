'use client';

const SVGS = {
n1:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 32 Q60 12 100 32" stroke="#C4875A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M60 32 L60 68" stroke="#C4875A" stroke-width="1.5" stroke-dasharray="3 2"/>
  <circle cx="60" cy="79" r="12" fill="#EEE0FF" stroke="#C4875A" stroke-width="1.5"/>
  <circle cx="60" cy="79" r="8" fill="#D4B0E8"/>
  <circle cx="56" cy="75" r="3" fill="white" opacity=".55"/>
  <circle cx="60" cy="32" r="3" fill="#C4875A"/>
</svg>`,
n2:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 30 Q60 10 102 30" stroke="#A8A8C8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M60 30 L60 72" stroke="#A8A8C8" stroke-width="1" stroke-dasharray="3 2"/>
  <circle cx="42" cy="36" r="5" fill="#C8A8F8" opacity=".85"/>
  <circle cx="78" cy="36" r="5" fill="#C8A8F8" opacity=".85"/>
  <circle cx="28" cy="40" r="3.5" fill="#A07BD0" opacity=".65"/>
  <circle cx="92" cy="40" r="3.5" fill="#A07BD0" opacity=".65"/>
  <polygon points="60,62 66,78 60,86 54,78" fill="#C8A8F8" stroke="#7B5EA7" stroke-width="1.2"/>
  <line x1="60" y1="62" x2="66" y2="78" stroke="white" stroke-width=".7" opacity=".7"/>
</svg>`,
n3:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 46 Q60 26 106 46" stroke="#D4944A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="36" cy="44" r="6" fill="#E8A840" stroke="#D4944A" stroke-width="1.2"/>
  <circle cx="56" cy="38" r="6" fill="#E8A840" stroke="#D4944A" stroke-width="1.2"/>
  <circle cx="76" cy="38" r="6" fill="#E8A840" stroke="#D4944A" stroke-width="1.2"/>
  <circle cx="96" cy="44" r="6" fill="#E8A840" stroke="#D4944A" stroke-width="1.2"/>
  <circle cx="60" cy="36" r="8.5" fill="#F4C848" stroke="#D4944A" stroke-width="1.8"/>
  <path d="M56 36 L60 29 L64 36 L60 43 Z" fill="#E8A840" opacity=".75"/>
  <circle cx="60" cy="36" r="2.5" fill="white" opacity=".5"/>
</svg>`,
n4:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 28 Q60 12 98 28" stroke="#C0C8D8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M60 28 L60 65" stroke="#C0C8D8" stroke-width="1" stroke-dasharray="3 2"/>
  <polygon points="60,65 68,78 60,92 52,78" fill="#E8F2FF" stroke="#98B0D0" stroke-width="1.8"/>
  <line x1="52" y1="78" x2="60" y2="65" stroke="white" stroke-width=".8" opacity=".8"/>
  <line x1="68" y1="78" x2="60" y2="65" stroke="white" stroke-width=".8" opacity=".6"/>
  <circle cx="60" cy="78.5" r="3" fill="white" opacity=".9"/>
  <circle cx="60" cy="28" r="3" fill="#C0C8D8"/>
</svg>`,
n5:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M28 28 Q60 12 92 28" stroke="#B0B8C8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M60 28 L60 60" stroke="#B0B8C8" stroke-width="1" stroke-dasharray="3 2"/>
  <path d="M48 72 Q47 56 58 58 Q64 53 72 59 Q78 66 72 74 Q65 80 60 82 Q50 80 48 72 Z" fill="#EDE4FF" stroke="#8090A8" stroke-width="1.8"/>
  <path d="M56 66 Q60 64 64 68" stroke="#8090A8" stroke-width="1" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="64" r="2" fill="#B0B8C8" opacity=".5"/>
</svg>`,
e1:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="18" x2="40" y2="28" stroke="#C4875A" stroke-width="2"/>
  <circle cx="40" cy="28" r="3" fill="#C4875A"/>
  <circle cx="40" cy="46" r="16" fill="#F5E6FF" stroke="#C4875A" stroke-width="2"/>
  <circle cx="40" cy="46" r="11" fill="#DDB0E0" stroke="#C4875A" stroke-width="1"/>
  <circle cx="36" cy="42" r="3.5" fill="white" opacity=".55"/>
  <line x1="80" y1="18" x2="80" y2="28" stroke="#C4875A" stroke-width="2"/>
  <circle cx="80" cy="28" r="3" fill="#C4875A"/>
  <circle cx="80" cy="46" r="16" fill="#F5E6FF" stroke="#C4875A" stroke-width="2"/>
  <circle cx="80" cy="46" r="11" fill="#DDB0E0" stroke="#C4875A" stroke-width="1"/>
  <circle cx="76" cy="42" r="3.5" fill="white" opacity=".55"/>
</svg>`,
e2:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="16" x2="40" y2="30" stroke="#C4875A" stroke-width="2"/>
  <path d="M30 30 Q40 36 50 30 Q50 60 40 84 Q30 60 30 30Z" fill="#C4A8F0" stroke="#7B5EA7" stroke-width="1.4"/>
  <circle cx="35" cy="54" r="4" fill="white" opacity=".55"/>
  <circle cx="45" cy="66" r="3" fill="white" opacity=".45"/>
  <circle cx="40" cy="78" r="3.5" fill="white" opacity=".4"/>
  <line x1="80" y1="16" x2="80" y2="30" stroke="#C4875A" stroke-width="2"/>
  <path d="M70 30 Q80 36 90 30 Q90 60 80 84 Q70 60 70 30Z" fill="#C4A8F0" stroke="#7B5EA7" stroke-width="1.4"/>
  <circle cx="75" cy="54" r="4" fill="white" opacity=".55"/>
  <circle cx="85" cy="66" r="3" fill="white" opacity=".45"/>
  <circle cx="80" cy="78" r="3.5" fill="white" opacity=".4"/>
</svg>`,
e3:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 20 Q38 16 36 18 Q34 22 36 26 L40 28" stroke="#C4875A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="40" cy="58" r="24" fill="none" stroke="#C4875A" stroke-width="3"/>
  <circle cx="40" cy="58" r="20" fill="none" stroke="#C4875A" stroke-width=".8" opacity=".4"/>
  <path d="M80 20 Q78 16 76 18 Q74 22 76 26 L80 28" stroke="#C4875A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="80" cy="58" r="24" fill="none" stroke="#C4875A" stroke-width="3"/>
  <circle cx="80" cy="58" r="20" fill="none" stroke="#C4875A" stroke-width=".8" opacity=".4"/>
</svg>`,
e4:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="38" y1="16" x2="38" y2="28" stroke="#B0B8C8" stroke-width="2"/>
  <polygon points="38,28 45,44 38,84 31,44" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.8"/>
  <line x1="31" y1="44" x2="38" y2="28" stroke="white" stroke-width=".8" opacity=".75"/>
  <line x1="45" y1="44" x2="38" y2="28" stroke="white" stroke-width=".6" opacity=".55"/>
  <circle cx="38" cy="56" r="2" fill="white" opacity=".8"/>
  <line x1="82" y1="16" x2="82" y2="28" stroke="#B0B8C8" stroke-width="2"/>
  <polygon points="82,28 89,44 82,84 75,44" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.8"/>
  <line x1="75" y1="44" x2="82" y2="28" stroke="white" stroke-width=".8" opacity=".75"/>
  <circle cx="82" cy="56" r="2" fill="white" opacity=".8"/>
</svg>`,
e5:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="38" y1="14" x2="38" y2="24" stroke="#C4875A" stroke-width="2"/>
  <circle cx="38" cy="24" r="5.5" fill="#E8A040" stroke="#C4875A" stroke-width="1.2"/>
  <circle cx="38" cy="68" r="26" fill="#F0D898" stroke="#C4875A" stroke-width="1.8"/>
  <circle cx="38" cy="68" r="20" fill="none" stroke="#C4875A" stroke-width="1.2"/>
  <circle cx="28" cy="58" r="3.5" fill="#C4875A" opacity=".6"/>
  <circle cx="48" cy="58" r="3.5" fill="#C4875A" opacity=".6"/>
  <circle cx="38" cy="76" r="3.5" fill="#C4875A" opacity=".6"/>
  <line x1="78" y1="14" x2="78" y2="24" stroke="#C4875A" stroke-width="2"/>
  <circle cx="78" cy="24" r="5.5" fill="#E8A040" stroke="#C4875A" stroke-width="1.2"/>
  <circle cx="78" cy="68" r="26" fill="#F0D898" stroke="#C4875A" stroke-width="1.8"/>
  <circle cx="78" cy="68" r="20" fill="none" stroke="#C4875A" stroke-width="1.2"/>
  <circle cx="68" cy="58" r="3.5" fill="#C4875A" opacity=".6"/>
  <circle cx="88" cy="58" r="3.5" fill="#C4875A" opacity=".6"/>
  <circle cx="78" cy="76" r="3.5" fill="#C4875A" opacity=".6"/>
</svg>`,
b1:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="72" rx="46" ry="14" fill="none" stroke="#C4875A" stroke-width="2"/>
  <circle cx="38" cy="65" r="8" fill="#F5E6FF" stroke="#C4875A" stroke-width="1.5"/>
  <circle cx="38" cy="65" r="5" fill="#DDB0E0"/>
  <circle cx="35" cy="62" r="2" fill="white" opacity=".5"/>
  <circle cx="60" cy="60" r="8" fill="#F5E6FF" stroke="#C4875A" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="5" fill="#DDB0E0"/>
  <circle cx="57" cy="57" r="2" fill="white" opacity=".5"/>
  <circle cx="82" cy="65" r="8" fill="#F5E6FF" stroke="#C4875A" stroke-width="1.5"/>
  <circle cx="82" cy="65" r="5" fill="#DDB0E0"/>
  <circle cx="79" cy="62" r="2" fill="white" opacity=".5"/>
</svg>`,
b2:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="52" rx="42" ry="12" fill="none" stroke="#D4944A" stroke-width="2.5"/>
  <ellipse cx="60" cy="63" rx="42" ry="12" fill="none" stroke="#A07BD0" stroke-width="2"/>
  <circle cx="82" cy="63" r="4.5" fill="#C8A8F8" stroke="#7B5EA7" stroke-width="1"/>
  <circle cx="38" cy="63" r="4.5" fill="#C8A8F8" stroke="#7B5EA7" stroke-width="1"/>
  <circle cx="60" cy="62" r="4.5" fill="#C8A8F8" stroke="#7B5EA7" stroke-width="1"/>
  <ellipse cx="60" cy="74" rx="42" ry="12" fill="none" stroke="#C8C8D8" stroke-width="1.5"/>
</svg>`,
b3:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="70" rx="46" ry="14" fill="none" stroke="#C4875A" stroke-width="2"/>
  <rect x="22" y="65" width="14" height="8" rx="1.5" fill="none" stroke="#C4875A" stroke-width="1.5"/>
  <rect x="42" y="65" width="14" height="8" rx="1.5" fill="none" stroke="#C4875A" stroke-width="1.5"/>
  <rect x="62" y="65" width="14" height="8" rx="1.5" fill="none" stroke="#C4875A" stroke-width="1.5"/>
  <rect x="82" y="65" width="14" height="8" rx="1.5" fill="none" stroke="#C4875A" stroke-width="1.5"/>
</svg>`,
b4:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 70 Q28 50 60 48 Q92 50 106 70" stroke="#D4944A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M14 74 Q28 54 60 52 Q92 54 106 74" stroke="#D4944A" stroke-width="1" fill="none" opacity=".35" stroke-linecap="round"/>
  <circle cx="60" cy="48" r="6" fill="#E8A840" opacity=".9"/>
  <circle cx="40" cy="57" r="4" fill="#E8A840" opacity=".65"/>
  <circle cx="80" cy="57" r="4" fill="#E8A840" opacity=".65"/>
  <circle cx="22" cy="68" r="3" fill="#E8A840" opacity=".45"/>
  <circle cx="98" cy="68" r="3" fill="#E8A840" opacity=".45"/>
</svg>`,
b5:`<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="70" rx="46" ry="14" fill="none" stroke="#C0C8D8" stroke-width="1.8"/>
  <circle cx="18" cy="70" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="31" cy="58" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="46" cy="55" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="60" cy="54" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="74" cy="55" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="89" cy="58" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="102" cy="70" r="5.5" fill="#E4EEFF" stroke="#98B0D0" stroke-width="1.5"/>
  <circle cx="20" cy="68" r="2" fill="white" opacity=".85"/>
  <circle cx="60" cy="52" r="2" fill="white" opacity=".85"/>
  <circle cx="102" cy="68" r="2" fill="white" opacity=".85"/>
</svg>`,
};

export default function ProductSvg({ svgKey, imageUrl, size = 130 }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, display: 'block' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  const svg = SVGS[svgKey] || '';
  return (
    <div
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
