function getLink(name: string, href: string): string {
  return `<a class="link external" href="${href}" target="_blank">${name}</a>`;
}

function getInnerLink(name: string, href: string): string {
  return `<a href="${href}" data-navigo>${name}</a>`;
}

const setAll = `<div style="margin: .5rem;">
    ${getInnerLink('SetAll', '/mbox/set_all/')} (SetAll)
</div>
`.trim();

const engine = `<div style="margin: .5rem;">
    ${getInnerLink('Engine', '/mbox/engine/')} (Мотор)
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

const content = `
  ${engine}
  ${billy}
  ${carcassiOp60n7}
  ${bell}
  ${partingGlass}
  ${tiriTiri}  
  ${setAll}  
`.trim();

export default {
  content: '',
  tracks: [],
  source: 'my',
  oldNs: 'my',
  ns: 'my-song',
  isSongList: true,
};
