import dynamic from '../mbox_dynamics/billy.dynamic';

const score = `
<settings>
# pitchShift: -1
_ $bass: v30; $back: v20; $mark: v0;

<out b105>
> проход    %A
> РИФФ      %B
> РИФФ      %C
> КУПЛЕТ    %D
> КУПЛЕТ    %E
> РИФФ      %F
> РИФФ      %G
> КУПЛЕТ    %H
> КУПЛЕТ    %I
> сбивка    %J
> соло_бас  %K
> соло_бас  %L
> СОЛО_2_1  %M
> СОЛО_2_2  %N
> КОДА      %O

<РИФФ b105 set>
оЯюЯ:3
проход

<КОДА b105 set>
оЯюЯ:3
проход_кода

<проход b105 $>
$solo1: де=90 ла=90 ма=60 фа=90 ма=90 да=60 $organ*r
#$solo1: де=90 ла=90 ма=60 фа=90 ма=90 да=60 $flute v20

<проход_кода b105 $>
$solo1: да=30 60 ло=30 60 мо=30 30 фо=30 60 мо=30 60 до=30 30 лу=30 $organ*r
$solo1: де=30 60 ла=30 60 ма=30 30 фа=30 60 ма=30 60 да=30 30 ло=30 $xylo

<оЯюЯ b105 $>
$guit: лу=90 мо+ло=60 лу=30 мо+ло=60 до=90 ро=90 мо=60 $guitar*EC
$bass: лы=60 лы=60 лы=60 лы=60 лы=60 лы=60 лы=60 лы=60 $eBass*f v40
$mark: ле=60 $xylo

<куплет_соло b105 $>
$solo: 0    лу=90 до=90 ро=60 мо=90 ро=90 до=60 $guitar*EC #480
$solo: 480  лу=90 до=90 ро=60 фо=90 мо=90 до=60 $guitar*EC #480
$solo: 960  лу=90 до=90 ро=60 мо=90 ро=90 до=60 $guitar*EC #480
$solo: 1440 ро=90 до=90 бу=60 до=90 бу=90 су=60 $guitar*EC #480
# 8Q   1920

<КУПЛЕТ b105 set>
куплет_бас куплет_фон куплет_соло

<куплет_бас b105 $> #1920
$bass: 0    лы=90 му=90 му=60 ду=90 ду=90 му=60 $eBass*f
$bass: 480  лы=90 му=90 му=60 фу=90 ду=90 му=60 $eBass*f
$bass: 960  лы=90 му=90 му=60 ду=90 ду=90 му=60 $eBass*f
$bass: 1440 ру=90 ру=90 бы=60 ду=90 ду=90 сы=60 $eBass*f

<куплет_фон b105 $>
$back: 0    лу=480    лу=480    лу=480    ро=240 до=240  $organ
$mark: 0    ле=80 400 ле=80 400 ле=80 400 ле=80 400      $xylo
# 8Q   1920

<соло_бас b105 $>
$mark:     0   ле=80 400  ле=80 400  ле=80 400  ле=80 400 $xylo
$bass: 0       лу=90 *f мо=90 до=40 20  бу=90 *f со=90 бу=50 $cBass*f v100 #480
$bass: 480     до=90 *f мо=90 до=40 20  ро=90 *f мо=90 фо=50 $cBass*f v100 #480
$bass: 960     мо=90 *f до=90 су=40 20  ро=90 *f бу=90 су=50 $cBass*f v100 #480
$bass: 1440    мо=90 *f до=90 су=40 20  зу=90 *f бу=90 мо=50 $cBass*f v100 #480
# 8Q       1920

<сбивка b105 $>
$guit: 0    лу+мо+ло=30 лу+мо+ло=30 *EDM лу=30 лу=30 лу=30 лу=30 лу=30 лу=30    $guitar*ED
$guit: 240  бу+мо+ло=30 бу+мо+ло=30 *EDM бу=30 бу=30 бу=30 бу=30 бу=30 бу=30    $guitar*ED
$guit: 480  до+мо+да=30 до+мо+да=30 *EDM до=30 до=30 до=30 до=30 до=30 до=30    $guitar*ED
$guit: 720  то+мо+ло=30 то+мо+ло=30 *EDM то=30 то=30 то=30 то=30 то=30 то=30    $guitar*ED
$guit: 960  ро+ло+ра=30 ро+ло+ра=30 *EDM ро=30 ро=30 ро=30 ро=30 ро=30 ро=30    $guitar*ED
$guit: 1200 но+ло+на=30 но+ло+на=30 *EDM но=30 но=30 но=30 но=30 но=30 но=30    $guitar*ED
$guit: 1440 мо+бо+ма=30 мо+бо+ма=30 *EDM мо=30 мо=30 мо=30 мо=30 мо=30 мо=30    $guitar*ED
$guit: 1680 мо+бо=30     *EDM ро=30      ро=30 до=30 до=30 бу=30 бу=30 зу=30    $guitar*ED

<соло1 b105 $>
$mark:  0    ле=80 400 ле=80 400 ле=80 400 ле=80 400 $xylo
# 8Q:  1920

<СОЛО_2_1 b105 set>
соло2_бас соло2_соло1
соло2_бас соло2_соло2

<соло2_бас b105 $>
$bass: 0   лы=90 ду=90 лы=60  бы=90 ру=90 бы=60  ду=90 му=90 ду=60  ру=90 фу=90 ру=60 $eBass*f
$bass: 960 ду=90 му=90 ду=60  бы=90 ру=90 бы=60  ду=90 му=90 ду=60  му=90 зу=90 му=60 $eBass*f
$mark: 0   ле=80 400   ле=80 400    ле=80 400    ле=80 400 $xylo

<соло2_соло1 b105 $>
$solo: 120      ма=120 ма=120 ра=60 да=180 d480 $organ*r
$back: 0        лу=240 бу=240 $organ
$solo: 480 180  да=60 ра=60 ма=60 фа=120 d480 $organ*r
$back: 480      до=240 ро=240 $organ
$solo: 960      ма=90 30 да=120 да=120 бо=60 да=180 d480 $organ*r
$back: 960      до=240 бу=240 $organ
$solo: 1440 180 бо=60 да=60 ра=60 да=60 бо=60 d480 $organ*r
$back: 1440     до=240 мо=240 $organ

<соло2_соло2 b105 $>
$solo: ло=120   ма=120 ма=120 ра=60 да=180 d480 $organ*r
$back: 0        лу=240 бу=240 $organ
$solo: 480 180  да=60 ра=60 ма=60 фа=120 d480 $organ*r
$back: 480      до=240 ро=240 $organ
$solo: 960      ма=90 30 да=120 да=120 бо=120 d480 $organ*r
$back: 960      до=240 бу=240 $organ
$solo: 1440     да=30 ра=30 да=180 120 бо=120  d480 $organ*r
$back: 1440     до=240 мо=240 $organ

<tick b105 @>
-       : 1 2 3 4 :
@cowbell: x x x x :


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
  dynamic,
};
