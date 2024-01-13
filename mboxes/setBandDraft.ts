function getInnerLink(name: string, href: string): string {
  return `<a class="link" href="${href}">${name}</a>`;
}

const glass = `<div style="margin: .5rem;">
    ${getInnerLink('Стакан (Glass)', '/mbox/glass/')}
</div>
`.trim();

const butterflyEffect = `<div style="margin: .5rem;">
    ${getInnerLink('Эффект бабочки (Butterfly effect)', '/mbox/butterflyEffect/')}
</div>
`.trim();

const content = `
  ${glass}
  ${butterflyEffect}  
  <div style="margin-bottom: 3rem;"></div>
`.trim();

export default {
  content,
  tracks: [],
  isSongList: true,
  ns: 'band-song',
};
