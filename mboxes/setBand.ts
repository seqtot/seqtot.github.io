function getLink(name: string, href: string): string {
  return `<a class="link external" href="${href}" target="_blank">${name}</a>`;
}

function getInnerLink(name: string, href: string): string {
  return `<a class="link" href="${href}">${name}</a>`;
}

function getBpmLink(bpm: number): string {
  return `<a
    class="link external"
    target="_blank"
    data-set-bmp-action
    data-bpm="${bpm}"
  >${bpm}</a>`;
}

const setAll = `<div style="margin: .5rem;">
    ${getInnerLink('SetAll', '/mbox/set_all/')} (SetAll)
</div>
`.trim();

const billy = `<div style="margin: .5rem;">
    ${getInnerLink('Billy', '/mbox/billy/')} (Билли)
</div>
`.trim();

const partingGlass = `<div style="margin: .5rem;">
    ${getInnerLink('The parting glass', '/mbox/partingGlass/')} (Чарка на посошок)
</div>
`.trim();

const carcassiOp60n7 = `<div style="margin: .5rem;">
    ${getInnerLink('Matteo Carcassi, opus 60-7', '/mbox/carcassiOp60n7/')}
</div>
`.trim();

const tiriTiri = `<div style="margin: .5rem;">
    ${getInnerLink('тырыТыры', '/mbox/tiriTiri/')} (tiriTiri)
</div>
`.trim();

const bell = `<div style="margin: .5rem;">
    ${getInnerLink('Колокольчик', '/mbox/bell/')} (bell)
</div>
`.trim();

const enterSandmen = `<div style="margin: .5rem;">
  <b>Enter Sandman: ${getBpmLink(124)}</b> (Metallica)<br/>
  ${getLink('lesson', 'https://www.youtube.com/watch?v=NIAkEJp8i_Y')} |
  ${getLink(
    'tabs',
    'https://www.songsterr.com/a/wsa/metallica-enter-sandman-tab-s19'
  )}
</div>
`;

const peterGunn = `<div style="margin: .5rem;">
  <b>Peter Gunn: ${getBpmLink(124)}</b><br/>
  ${getLink('lesson', 'https://www.youtube.com/watch?v=vhdSodIxZSE')} |
  ${getLink('Duane Eddy', 'https://www.youtube.com/watch?v=296wS9ome4M')}
</div>
`;

const blackNight = `<div style="margin: .5rem;">
  <b>Black Night: ${getBpmLink(134)}</b> (Deep Purple)<br/>
  ${getLink('youtube', 'https://www.youtube.com/watch?v=QuAKMlfxX7I')} |
  ${getLink(
    'tabs',
    'https://www.songsterr.com/a/wsa/deep-purple-black-night-tab-s23516t6'
  )}
</div>`;

const itsMyLife = `<div style="margin: .5rem;">
  <b>It's My Life: ${getBpmLink(120)}</b> (Bon Jovi)<br/>
  ${getLink(
    'tabs',
    'https://www.songsterr.com/a/wsa/bon-jovi-its-my-life-4-string-bass-tab-s442387'
  )} |
  ${getLink('youtube', 'https://www.youtube.com/watch?v=vx2u5uUu3DE')} |
  ${getLink('lesson', 'https://www.youtube.com/watch?v=3Npebqu-rl8')} |
  ${getLink(
    'chords',
    'https://www.ackordofmine.ru/index/bon_jovi_it_96_s_my_life_tekst_pesni_s_akkordami/0-1974'
  )}
</div>`;

const pacificZodiac = `<div style="margin: .5rem;">
  <b>Pacific: ${getBpmLink(118)}</b> (Zodiac, 1980)<br/>
  ${getLink('youtube', 'https://www.youtube.com/watch?v=W33mp0TYVv8')} |
  ${getLink('lesson', 'https://www.youtube.com/watch?v=eNoKyYsbuNA')}
</div>`;

const agressiveSamurai = `<div style="margin: .5rem;">
  <b>Agressive: ${getBpmLink(75)}</b>  (Samurai, 2022)<br/>
  ${getLink('youtube', 'https://www.youtube.com/watch?v=jVtuIMm52aQ')}
</div>`;

const sweetChild = `<div style="margin: .5rem;">
  <b>Sweet Child O' Mine: ${getBpmLink(128)}</b> (Guns N' Roses, 1988)<br/>
  ${getLink('youtube', 'https://www.youtube.com/watch?v=1w7OgIMMRc4')} |
  ${getLink(
    'tabs',
    'https://www.songsterr.com/a/wsa/guns-n-roses-sweet-child-o-mine-standard-tunning-tab-s412809'
  )}
</div>`;

const itsGoingGood = `<div style="margin: .5rem;">
  <b>It's Going Good!: ${getBpmLink(95)}</b> (Sueco)<br/>
  ${getLink('youtube', 'https://www.youtube.com/watch?v=1w7OgIMMRc4')} |
</div>`;

const content = `
  ${billy}
  ${carcassiOp60n7}
  ${bell}
  ${partingGlass}
  ${tiriTiri}  
  ${setAll}  
  <div style="margin-bottom: 3rem;"></div>
`.trim();

// ${peterGunn}
// ${enterSandmen}
// ${blackNight}
// ${itsMyLife}
// ${pacificZodiac}
// ${agressiveSamurai}
// ${sweetChild}
// ${itsGoingGood}

export default {
  content,
  tracks: [],
};
