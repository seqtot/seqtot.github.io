function getInnerLink(name: string, href: string): string {
  return `<a class="link" href="${href}" data-route>${name}</a>`;
}

const shipsAreSailing = `<div style="margin: .5rem;">
    ${getInnerLink('Ships are sailing (215)', '/mbox/shipsAreSailing')}
</div>
`.trim();

const brotherBilly = `<div style="margin: .5rem;">
    ${getInnerLink('Брат Билли (Brother Billy)', '/mbox/brotherBilly')}
</div>
`.trim();

const cage = `<div style="margin: .5rem;">
    ${getInnerLink('Клетка (Cage)', '/mbox/cage')}
</div>
`.trim();

const mosquito = `<div style="margin: .5rem;">
    ${getInnerLink('Комар (Mosquito)', '/mbox/mosquito')}
</div>
`.trim();

const inSystem = `<div style="margin: .5rem;">
    ${getInnerLink('В системе (In system)', '/mbox/inSystem')}
</div>
`.trim();

const glass = `<div style="margin: .5rem;">
    ${getInnerLink('Стакан (Glass)', '/mbox/glass')}
</div>
`.trim();

const butterflyEffect = `<div style="margin: .5rem;">
    ${getInnerLink('Эффект бабочки (Butterfly effect)', '/mbox/butterflyEffect')}
</div>
`.trim();

const roundtrip = `<div style="margin: .5rem;">
    ${getInnerLink('Туда-сюда (Roundtrip)', '/mbox/roundtrip')}
</div>
`.trim();

const abt1 = `<div style="margin: .5rem;">
    ${getInnerLink('Abt 1 (вокализ)', '/mbox/abt1')}
</div>
`.trim();

const content = `
  ${shipsAreSailing}
  ${brotherBilly}
  ${cage}
  ${mosquito}
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
