function getInnerLink(name: string, href: string): string {
  return `<a class="link" href="${href}">${name}</a>`;
}

const inSystem = `<div style="margin: .5rem;">
    ${getInnerLink('В системе (In system)', '/mbox/inSystem/')}
</div>
`.trim();

const glass = `<div style="margin: .5rem;">
    ${getInnerLink('Стакан (Glass)', '/mbox/glass/')}
</div>
`.trim();

const butterflyEffect = `<div style="margin: .5rem;">
    ${getInnerLink('Эффект бабочки (Butterfly effect)', '/mbox/butterflyEffect/')}
</div>
`.trim();

const roundtrip = `<div style="margin: .5rem;">
    ${getInnerLink('Туда-сюда (Roundtrip)', '/mbox/roundtrip/')}
</div>
`.trim();

const abt1 = `<div style="margin: .5rem;">
    ${getInnerLink('Abt 1 (вокализ)', '/mbox/abt1/')}
</div>
`.trim();

const content = `
  ${inSystem}
  ${glass}
  ${butterflyEffect}
  ${roundtrip}
  ${abt1}  
  <div style="margin-bottom: 3rem;"></div>
`.trim();

export default {
  content,
  tracks: [],
  isSongList: true,
  ns: 'band-song',
};
