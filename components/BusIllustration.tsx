import { SvgXml } from 'react-native-svg';

import { useTheme } from '../src/theme';

const DARK_BUS_SVG = `
<svg width="390" height="160" viewBox="0 0 390 160" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>Bus illustration — dark theme</title>
  <desc>Animated bus rolling in from the left on a night road</desc>
  <defs>
    <style>
      @keyframes bus{0%{transform:translateX(-300px)}100%{transform:translateX(0)}}
      @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
      .busgroup{animation:bus 1.6s cubic-bezier(.25,.46,.45,.94) both}
      .s1{animation:twinkle 2.1s ease-in-out infinite}
      .s2{animation:twinkle 3.3s ease-in-out infinite}
      .s3{animation:twinkle 1.8s ease-in-out infinite}
    </style>
  </defs>
  <rect width="390" height="100" fill="#0C1220"/>
  <circle cx="342" cy="38" r="26" fill="#3C3489" opacity="0.6"/>
  <circle cx="353" cy="29" r="20" fill="#0C1220"/>
  <circle class="s1" cx="30"  cy="18" r="1.5" fill="#CECBF6"/>
  <circle class="s2" cx="90"  cy="10" r="1"   fill="#CECBF6"/>
  <circle class="s3" cx="150" cy="28" r="1.5" fill="#9FE1CB"/>
  <circle class="s1" cx="60"  cy="52" r="1"   fill="#CECBF6"/>
  <circle class="s2" cx="230" cy="16" r="2"   fill="#CECBF6"/>
  <circle class="s3" cx="270" cy="44" r="1"   fill="#9FE1CB"/>
  <circle class="s1" cx="190" cy="60" r="1.5" fill="#CECBF6"/>
  <circle class="s2" cx="120" cy="70" r="1"   fill="#CECBF6"/>
  <rect y="100" width="390" height="42" fill="#1A1A18"/>
  <rect x="0"   y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect x="72"  y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect x="144" y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect x="216" y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect x="288" y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect x="360" y="118" width="50" height="5" rx="2" fill="#2C2C2A"/>
  <rect y="140" width="390" height="3" fill="#2C2C2A"/>
  <g class="busgroup">
    <rect x="40" y="44" width="290" height="68" rx="10" fill="#085041"/>
    <rect x="296" y="53" width="26" height="42" rx="4" fill="#5DCAA5" opacity="0.18"/>
    <rect x="58"  y="56" width="38" height="26" rx="4" fill="#EF9F27" opacity="0.22"/>
    <rect x="106" y="56" width="38" height="26" rx="4" fill="#EF9F27" opacity="0.28"/>
    <rect x="154" y="56" width="38" height="26" rx="4" fill="#EF9F27" opacity="0.2"/>
    <rect x="202" y="56" width="38" height="26" rx="4" fill="#EF9F27" opacity="0.25"/>
    <rect x="250" y="56" width="38" height="26" rx="4" fill="#EF9F27" opacity="0.22"/>
    <rect x="62"  y="59" width="30" height="20" rx="2" fill="#FAC775" opacity="0.12"/>
    <rect x="110" y="59" width="30" height="20" rx="2" fill="#FAC775" opacity="0.12"/>
    <rect x="158" y="59" width="30" height="20" rx="2" fill="#FAC775" opacity="0.12"/>
    <rect x="206" y="59" width="30" height="20" rx="2" fill="#FAC775" opacity="0.12"/>
    <rect x="254" y="59" width="30" height="20" rx="2" fill="#FAC775" opacity="0.12"/>
    <rect x="322" y="72" width="10" height="8" rx="2" fill="#FAC775"/>
    <polygon points="332,72 390,58 390,88 332,80" fill="#FAC775" opacity="0.05"/>
    <rect x="40" y="104" width="290" height="6" fill="#04342C"/>
    <rect x="142" y="92" width="76" height="18" rx="4" fill="#04342C"/>
    <text x="180" y="105" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#5DCAA5">#1256</text>
    <circle cx="100" cy="130" r="17" fill="#111110"/>
    <circle cx="100" cy="130" r="9"  fill="#444441"/>
    <circle cx="100" cy="130" r="4"  fill="#111110"/>
    <circle cx="280" cy="130" r="17" fill="#111110"/>
    <circle cx="280" cy="130" r="9"  fill="#444441"/>
    <circle cx="280" cy="130" r="4"  fill="#111110"/>
  </g>
</svg>
`;

const LIGHT_BUS_SVG = `
<svg width="390" height="160" viewBox="0 0 390 160" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>Bus illustration — light theme</title>
  <desc>Animated bus rolling in from the left on a daytime road</desc>
  <defs>
    <style>
      @keyframes bus{0%{transform:translateX(-300px)}100%{transform:translateX(0)}}
      @keyframes wheel{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      .busgroup{animation:bus 1.6s cubic-bezier(.25,.46,.45,.94) both}
    </style>
  </defs>
  <rect width="390" height="100" fill="#EBF4FD"/>
  <circle cx="348" cy="38" r="28" fill="#FAC775" opacity="0.5"/>
  <circle cx="348" cy="38" r="18" fill="#FAC775" opacity="0.7"/>
  <ellipse cx="72"  cy="34" rx="38" ry="15" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="98"  cy="27" rx="26" ry="13" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="50"  cy="31" rx="20" ry="11" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="210" cy="50" rx="28" ry="11" fill="#FFFFFF" opacity="0.7"/>
  <ellipse cx="232" cy="44" rx="20" ry="10" fill="#FFFFFF" opacity="0.7"/>
  <rect y="100" width="390" height="42" fill="#D3D1C7"/>
  <rect x="0"   y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect x="72"  y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect x="144" y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect x="216" y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect x="288" y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect x="360" y="118" width="50" height="5" rx="2" fill="#B4B2A9"/>
  <rect y="140" width="390" height="3" fill="#B4B2A9"/>
  <g class="busgroup">
    <rect x="40" y="44" width="290" height="68" rx="10" fill="#1D9E75"/>
    <rect x="296" y="53" width="26" height="42" rx="4" fill="#9FE1CB" opacity="0.55"/>
    <rect x="58"  y="56" width="38" height="26" rx="4" fill="#E1F5EE" opacity="0.85"/>
    <rect x="106" y="56" width="38" height="26" rx="4" fill="#E1F5EE" opacity="0.85"/>
    <rect x="154" y="56" width="38" height="26" rx="4" fill="#E1F5EE" opacity="0.85"/>
    <rect x="202" y="56" width="38" height="26" rx="4" fill="#E1F5EE" opacity="0.85"/>
    <rect x="250" y="56" width="38" height="26" rx="4" fill="#E1F5EE" opacity="0.85"/>
    <line x1="64"  y1="58" x2="64"  y2="80" stroke="#9FE1CB" stroke-width="1.5" opacity="0.5"/>
    <line x1="112" y1="58" x2="112" y2="80" stroke="#9FE1CB" stroke-width="1.5" opacity="0.5"/>
    <line x1="160" y1="58" x2="160" y2="80" stroke="#9FE1CB" stroke-width="1.5" opacity="0.5"/>
    <line x1="208" y1="58" x2="208" y2="80" stroke="#9FE1CB" stroke-width="1.5" opacity="0.5"/>
    <line x1="256" y1="58" x2="256" y2="80" stroke="#9FE1CB" stroke-width="1.5" opacity="0.5"/>
    <rect x="322" y="72" width="10" height="8" rx="2" fill="#FAC775"/>
    <rect x="40" y="104" width="290" height="6" rx="0" fill="#085041"/>
    <rect x="142" y="92" width="76" height="18" rx="4" fill="#085041"/>
    <text x="180" y="105" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#9FE1CB">#1256</text>
    <circle cx="100" cy="130" r="17" fill="#2C2C2A"/>
    <circle cx="100" cy="130" r="9"  fill="#888780"/>
    <circle cx="100" cy="130" r="4"  fill="#2C2C2A"/>
    <circle cx="280" cy="130" r="17" fill="#2C2C2A"/>
    <circle cx="280" cy="130" r="9"  fill="#888780"/>
    <circle cx="280" cy="130" r="4"  fill="#2C2C2A"/>
  </g>
</svg>
`;

export function BusIllustration() {
  const { mode } = useTheme();
  return <SvgXml xml={mode === 'dark' ? DARK_BUS_SVG : LIGHT_BUS_SVG} width="100%" height="100%" />;
}
