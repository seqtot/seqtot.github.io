function getInnerLink(name: string, href: string): string {
  return `<a class="link" href="${href}" data-route>${name}</a>`;
}

const shipsAreSailing = `<div style="margin: .5rem;">
    ${getInnerLink('Ships are sailing (215)', '/song/shipsAreSailing')}
</div>
`.trim();

const brotherBilly = `<div style="margin: .5rem;">
    ${getInnerLink('Брат Билли (Brother Billy)', '/song/brotherBilly')}
</div>
`.trim();

const cage = `<div style="margin: .5rem;">
    ${getInnerLink('Клетка (Cage)', '/song/cage')}
</div>
`.trim();

const mosquito = `<div style="margin: .5rem;">
    ${getInnerLink('Комар (Mosquito)', '/song/mosquito')}
</div>
`.trim();

const inSystem = `<div style="margin: .5rem;">
    ${getInnerLink('В системе (In system)', '/song/inSystem')}
</div>
`.trim();

const glass = `<div style="margin: .5rem;">
    ${getInnerLink('Стакан (Glass)', '/song/glass')}
</div>
`.trim();

const butterflyEffect = `<div style="margin: .5rem;">
    ${getInnerLink('Эффект бабочки (Butterfly effect)', '/song/butterflyEffect')}
</div>
`.trim();

const roundtrip = `<div style="margin: .5rem;">
    ${getInnerLink('Туда-сюда (Roundtrip)', '/song/roundtrip')}
</div>
`.trim();

const abt1 = `<div style="margin: .5rem;">
    ${getInnerLink('Abt 1 (вокализ)', '/song/abt1')}
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
