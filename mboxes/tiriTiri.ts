const score = `
<settings>
# pitchShift: 1
_ $bass: v20;  $guit: v30; $solo: v35;
_ $back: v5; $mark: v0;

# 12   24   36   48   60   72   84   96   108  120  132  144
# 120  240  360  480  600  720  840  960  1080 1200 1320 1440
# 1560 1680 1800 1920 2040 2160 2280 2400 2520 2640 2760 2880

<out b84 b90>
> ТЕМА   # a#a BDAB #fa BDAB de D#FAB #fa BDAB de #F#ABG #FED#C
> СОЛО1  # a#a BDAB #fa BDAB de D#FAB     BDAB de #F#ABG #FED#C
> ТЕМА   # -
> СОЛО2  # b#A  B#CDE  D#CD#F  B#CDE  D#F#B
> ТЕМА   # -
> КОДА   # a#ab
# ---------------------------------------------------------
<КОДА b84 set>
лыКыБы
# ---------------------------------------------------------
# b#A  B#CDE  D#CD#F  B#CDE  D#F#B
<СОЛО2 b84 set>
быКы               # b#A
solo2_1RS solo2_1  # B#CDE
solo2_2RS solo2_2  # D#CD#F
solo2_1RS solo2_3  # B#CDE
solo2_3RS solo2_4  # D#F#B

<solo2_4 b84 $> #720
$solo: 0   ва=60 ве=30 ме=30 ре=30 ба=30 $organ*r
$solo: 180 ла=60 ва=30 ла=30 ба=30 ре=30 $organ*r
$solo: 360 ба=60 ре=30 ме=30 ве=30 ле=30 $organ*r
$solo: 540 бе=45 $organ*r

<solo2_3 b84 $> #720
$solo: 0      ба=150_90_-2=30_-3=30 30 [ба=90 ла=30 ва=30] $organ*r
$solo: 180    ма=120_15_1=15_-1=15_-2=15_-3=60 [ма=15 фа=15 ма=15 ра=15 бо=60] $organ*r
$solo: 360 60 ра=120_30_2=30_2=30_-4=30 [ра=30 ма=30 ва=30 ра=30] $organ*r
$solo: 540    са=60 ра=120_60_2=60 [са=60 ра=60 ма=60] $organ*r

<solo2_2 b84 $> #720
$solo: 0   ра=60  бо=30 ра=30 ма=30 ва=30 $organ*r
$solo: 180 ка=60  ва=30 ма=30 ра=30 ма=30 $organ*r
$solo: 360 ра=60  бо=30 ра=30 бо=30 ло=30 $organ*r
$solo: 540 во=90  30          ва=30 30    $organ*r

<solo2_1 b84 $> #720
$solo: 0   60    ра=30 бо=30 ра=30 бо=30 $organ*r
$solo: 180 60    ма=120_30_1=15_-1=15_-2=30_-3=30 $organ*r
#$solo: 180 60    ма=30 фа=15 ма=15 ра=30 бо=30 $organ*r
$solo: 360 60    ра=30 ма=30 ва=30 ра=30 $organ*r
$solo: 540 0     ма=60 ва=60 ма=60 $organ*r


<testSlide b60 $> #720
$solo: ма=120 ма=120 ма=240_120_2=120 $organ*r
#$solo: ма=120_30_1=15_-1=15_-2=30_-3=30 $organ*r
#$solo: 180 60    ма=30 фа=15 ма=15 ра=30 бо=30 $organ*r

<solo2_3RS b80 $>
# D#F#B
$bass: РУ=180 ВУ=180 БЫ=240 $cBass*s
$back: ро=180 во=180 бу=240 $flute
$mark:  да=60 300  да=60 $xylo

<solo2_2RS b80 $>
# D#CD#F
$bass: РУ=180 ТУ=180 РУ=180 ВУ=180 $cBass*s
$back: ро=180 то=180 ро=180 во=180 $flute
$mark:  да=60 300  да=60 $xylo

<solo2_1RS b80 $>
# B#CDE
$bass: БЫ=180 ТУ=180 РУ=180 МУ=180 $cBass*s
$back: бу=180 то=180 ро=180 мо=180 $flute
$mark:  да=60 300  да=60 $xylo

# ---------------------------------------------------------
# a#a BDAB #fa BDAB de D#FAB BDAB de #F#ABG #FED#C
<СОЛО1 b84 set>
лыКы              #  a#a
solo1_1RS solo1_1 #  BDAB
выЛы              #  #fa
solo1_1RS solo1_2 #  BDAB
руМу              #  de
solo1_2RS solo1_3 #  D#FAB
solo1_1RS solo1_4 #  BDAB
руМу              #  de
solo1_3RS solo1_5 #  #F#ABG
solo1_4RS solo1_6 #  #FED#C

<solo1_1 b84 $>
$solo: 0   60    бо=30 та=30 ра=30 ма=30       $organ*r
$solo: 180 ва=60 ма=30 ра=30 та=30 бо=30       $organ*r
$solo: 360 ра=60 та=30 бо=30 ло=30 во=30 бо=60 $organ*r

<solo1_2 b84 $>
$solo: 0   60    бо=30 та=30 ра=30 ма=30       $organ*r
$solo: 180 ва=60 ма=30 ра=30 та=30 бо=30       $organ*r
$solo: 360 ра=60 та=30 бо=30 ра=30 ма=30 ва=60 $organ*r

<solo1_3 b84 $> #720
$solo: 0   60    ма=30 ва=30 ла=30 ва=30 $organ*r
$solo: 180 ба=60 ла=30 ва=30 ма=30 ра=30 $organ*r
$solo: 360 ва=60 ма=30 ра=30 ма=30 ва=30 $organ*r
$solo: 540 ма=60 ра=60       бо=60       $organ*r

<solo1_4 b84 $> #600
$solo: 0   60     бо=30 та=30 ра=30 ма=30 $organ*r
$solo: 180 ва=60  ма=30 ра=30 та=30 бо=30 $organ*r
$solo: 360 ра=60  та=30 бо=30 ло=30 во=30 $organ*r
$solo: 540 бо=60                          $organ*r

<solo1_5 b84 $> #720
$solo: 0   60     ра=30 ма=30 ва=30 ла=30 $organ*r
$solo: 180 ка=60  ва=30 за=30 ка=30 ва=30 $organ*r
$solo: 360 ба=60  ва=30 ма=30 ра=30 ва=30 $organ*r
$solo: 540 ма=60  ра=60       бо=60       $organ*r

<solo1_6 b84 $> #720
$solo: 0   60 бо=30 ра=30 ва=30 ба=45=50 d180 $organ*r
$solo: 180 60 бо=30 ра=30 ва=30 ре=45=50 d180 $organ*r
$solo: 360 60 бо=30 ра=30 ва=30 ме=45=50 d180 $organ*r

<solo1_1RS b84 $> #600
# BDAB
$bass: 0   БЫ=180 РУ=180 ЛЫ=180 БЫ=60 $cBass*s
$back: 0   бо=180 ра=180 ло=180 бо=60 $flute
$mark: 0   да=60 300  да=60 $xylo

<solo1_2RS b80 $> #720
# D#FAB
$bass: РУ=180 ВУ=180 ЛЫ=180 БЫ=180 $cBass*s
$back: ра=180 ва=180 ло=180 бо=180 $flute
$mark: да=60 300  да=60 $xylo

<solo1_3RS b80 $> #720
# #F#ABG
$bass: ВУ=180 КУ=180 БУ=180 СУ=180 $cBass*s
$back: ва=180 ка=180 ба=180 са=180 $flute
$mark: да=60 300  да=60 $xylo

<solo1_4RS b80 $> #600
# #FED#C
$bass: ВУ=180 МУ=180 РУ=180 ТУ=60 $cBass*s
$back: ва=180 ма=180 ра=180 та=60 $flute
$mark: да=60 300  да=60 $xylo

#---------------------------------------------------------
# a#a BDAB #fa BDAB de D#FAB #fa BDAB de #F#ABG #FED#C 
<ТЕМА b84 set>
лыКы   #  А#A
box1_1 #  BDAB
выЛы   #  #FA
box1_1 #  BDAB
руМу   #  DE
box1_2 #  D#FAB
выЛы   #  #FA
box1_1 #  BDAB
руМу   #  de
box1_3 #  #F#ABG
box1_4 #  #FED#C

<box1_4 b80 $>
# #FED#C
$bass: 0   ВУ=180 $cBass*s
$back: 0   ва=180 $flute
$guit: 0       60 ра=30 бо=30  ра=30 бо=30=35 d300 $egit*drp #180
$bass: 180 МУ=180 $cBass*s
$back: 180 ма=180 $flute
$guit: 180    60  ра=30 бо=30  ра=30 бо=30=35 d300 $egit*drp #180
$bass: 360 РУ=180 $cBass*s
$back: 360 ра=180 $flute
$guit: 360    60  ра=30 бо=30  ра=30 бо=30=35 d300 $egit*drp #180
$bass: 540 ТУ=60 $cBass*s
$back: 540 та=60 $flute
$mark: 0   да=60 300  да=60 $xylo
# 5Q  600

<box1_3 b80 $>
# #F#ABG
$bass: 0   ВУ=180 $cBass*s
$back: 0   ва=180 $flute
$guit: 0      60  ло=30 во=30  ло=30 во=30=35 d300 $egit*drp #180
$bass: 180 КУ=180 $cBass*s
$back: 180 ка=180 $flute
$guit: 180    60  ко=30 мо=30  ко=30 мо=30=35 d300 $egit*drp #180
$bass: 360 БУ=180 $cBass*s
$back: 360 ба=180 $flute
$guit: 360    60  ра=30 бо=30  ра=30 бо=30=35 d300 $egit*drp #180
$bass: 540 СУ=180 $cBass*s
$back: 540 са=180 $flute
$guit: 540     60 бо=30 фа=30  бо=30 фа=30=35 d300 $egit*drp #180
$mark: 0   да=60 300  да=60 $xylo
#     720 6Q

<box1_2 b84 $>
# D#FAB
$bass: 0   РУ=180 $cBass*s
$back: 0   ра=180 $flute
$guit: 0      60  во=30 ро=30  во=30 ро=30=35 d300 $egit*drp #180
$bass: 180 ВУ=180 $cBass*s
$back: 180 ва=180 $flute
$guit: 180    60  та=30 ко=30  та=30 ко=30=35 d300 $egit*drp #180
$bass: 360 ЛЫ=180 $cBass*s
$back: 360 ло=180 $flute
$guit: 360    60  то=30 лу=30  то=30 лу=30=35 d300 $egit*drp #180
$bass: 540 БЫ=60 $cBass*s
$back: 540 бо=60 $flute
$mark: 0   да=60 300  да=60 $xylo
#     600 5Q

<box1_1 b84 $>
# BDAB 
$bass: 0   БЫ=180 $cBass*s
$back: 0   ра=180 $flute
#$guit: 0      60  ро=60_30_-3=30 ро=60_30_-3=30 d300 $guitar*ED #180
$guit: 0      60  ро=30 бу=30  ро=30 бу=30=35 d300 $egit*drp #180
$bass: 180 РУ=180 $cBass*s
$back: 180 ва=180 $flute
#$guit: 180    60  во=60_30_-4=30  во=60_30_-4=30 d300 $guitar*ED #180
$guit: 180    60  во=30 ро=30  во=30 ро=30=35 d300 $egit*drp #180
$bass: 360 ЛЫ=180 $cBass*s
$back: 360 та=180 $flute
#$guit: 360    60  то=60_30_-4=30  то=60_30_-4=30 d300 $guitar*ED #180
$guit: 360    60  то=30 лу=30  то=30 лу=30=35 d300 $egit*drp #180
$bass: 540 БЫ=60 $cBass*s
$back: 540 ра=60 $flute
$mark: 0   да=60 300  да=60 $xylo
#     600 5Q

# other --------------------------------------------------------
<лыКы b80 $>
$bass: лы=60 кы=60 $cBass*s
$back: ло=60 та=60 $flute


<лыКыБы b80 $>
$bass: лы=60 кы=60 бы=360 $cBass*s
$back: ло=60 та=60 бо=360 $flute


<выЛы b80 $>
$bass: вы=60 лы=60 $cBass*s
$back: ло=60 та=60 $flute

<руМу b80 $>
$bass: ру=60 му=60 $cBass*s
$back: ва=60 са=60 $flute

<быКы b80 $>
$bass: бы=60 кы=60 $cBass*s
$back: бо=60 ко=60 $flute


<tick b120 @>
-       : 1234:
@cowbell: xxxx:


<note>
# абвгдеёжзийклмнопрстуфхцчшщъыьэюя
#   в    жз   лмн  рс  фx  шщ    юя
# о хлнм щшзв жфся
#
# ох_хнщл щн_лнщл нл_лч
# оа_аауа уа_аауа аа_уа
# он_нммн щм_нммн мн_мм
`.trim();

// <div style="margin: .5rem;">
// <pre style="font-family: monospace; margin: .5rem 0 0;">
// </pre>
// </div>

const info = `
<div style="margin: .5rem;">

<b>ТЕМА</b><br/>
a#a BDAB #fa BDAB de D#FAB #fa BDAB de #F#ABG #FED#C<br/>
<b>СОЛО1</b><br/>
a#a BDAB #fa BDAB de D#FAB     BDAB de #F#ABG #FED#C<br/>
<b>ТЕМА</b><br/>
<b>СОЛО2</b><br/>
b#A  B#CDE  D#CD#F  B#CDE  D#F#B
<b>ТЕМА</b><br/>
<b>КОДА</b><br/>
a#ab

<br/><br/>
</div>
`.trim();

export default {
  content: info,
  tracks: [],
  score
};