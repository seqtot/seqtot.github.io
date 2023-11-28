import songNodeHard from '../mbox_dynamics/noSystems.dynamic';

const score = `

<settings>
  # pitchShift: 2;
  @drums: v50; $bass: v50;  $guit: v50; $keys: v50;

# 12   24   36   48   60   72   84   96   108  120  132  144
# 120  240  360  480  600  720  840  960  1080 1200 1320 1440
# 1560 1680 1800 1920 2040 2160 2280 2400 2520 2640 2760 2880

<out b116>
> Tick   %xq [4*120]
> Mag1   %wp [4*8*120]
> Break1 %pv [8*120]
> Steps1 %fi [4*8*120]
> Split1 %nd [4*8*120]
> Mag2   %aq [4*8*120]
> Break2 %bd [8*120]
> Steps2 %dr [4*8*120]
> Split2 %cf [4*8*120]
> Mag3   %yg [4*8*120]
> Break3 %tg [9*120]

<Mag1 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Break1 b116 $>
$guit: d960 $egit*drp # 8*120

<Steps1 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Split1 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Mag2 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Break2 b116 $>
$guit: d960 $egit*drp # 8*120

<Steps2 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Split2 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Mag3 b116 $>
$guit: d3840 $egit*drp # 4*8*120

<Break3 b116 $>
$guit: d1080 $egit*drp # 9*120

<Tick b116 $>
$keys: ве=120=60 ве=120=60 ве=120=60 ве=120=60 $organ*r
$bass: ве=120=60 ве=120=60 ве=120=60 ве=120=60 $cBass*f



`.trim();

// <div style="margin: .5rem;">
// <pre style="font-family: monospace; margin: .5rem 0 0;">
// </pre>
// </div>

const info = `
<div style="margin: .5rem;">

</div>
`.trim();

export default {
  content: info,
  tracks: [],
  score,
  songNodeHard,
  ns: 'band-song',
  exportToLineModel: true,
};
