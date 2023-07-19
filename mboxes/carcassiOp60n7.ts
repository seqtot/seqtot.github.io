import dynamic from '../mbox_dynamics/carcassiOp60n7.dynamic';

const score = `
<info>
https://musescore.com/user/6428146/scores/1552756

<settings>
_ $bass: v20;  $guit: v50; $____: v25; # pitchShift: 1

# 12   24   36   48   60   72   84   96   108  120  132  144
# 120  240  360  480  600  720  840  960  1080 1200 1320 1440
# 1560 1680 1800 1920 2040 2160 2280 2400

<out b150>
> ИНТРО # A #a
> SOLO1 # ACFE DCBA D#DEF EEEE
> SOLO2 # ACFE DCBA D#DEF A
> ИНТРО # A #a
> SOLO3 # CEAG FEDD GGAB CDEC
> SOLO4 # FED#F GFE#G AAD#F EEEE EEDcBa EEEE EEDcBa #Gf E#d Ed Cb
> ИНТРО # A #a
> SOLO5 # ACFE DCBA DDEE F#CDE #FA#GE AEFC D#DEE A

<ИНТРО b150 set>
интро_бас интро_гит
интро_бас интро_гит

<интро_бас b150 $>
$bass: 0     лы=120 лу=60 лы=60 $cBass*f
#$bass: 0     лы=240_120_12=120=30 $cBass*f
$bass: 240   лы=120 лу=60 лы=60 $cBass*f
#$bass: 240   лы=240_120_12=120=60 $cBass*f
$bass:  480   лы=120 лу=60 лы=60 $cBass*f
#$bass: 480   лы=240_120_12=120=90 $cBass*f
$bass: 720   лы=180   ку=60 $cBass*f
#$bass: 720   лы=180         ку=60 $cBass*f
$bass: 960   лы=120 лу=60 лы=60 $cBass*f
#$bass: 960   лы=240_120_12=120=30 $cBass*f
$bass: 1200  лы=120 лу=60 лы=60 $cBass*f
#$bass: 1200  лы=240_120_12=120=60 $cBass*f
$bass:  1440  лы=120 лу=60 лы=60 $cBass*f
#$bass: 1440  лы=240_120_12=120=90 $cBass*f
$bass: 1680  ду=120  му=60 бы=60  $cBass*f v30

<интро_гит b150 $>
$guit: 0     лу=60 лу=60  ло.25=60:v60:*ed  лу=60         $guit*edm
$guit: 240   лу=60 лу=60  ло.50=60:v60:*ed  лу=60         $guit*edm
$guit: 480   лу=60 лу=60  ло.75=60:v60:*ed  лу=60         $guit*edm
$guit: 720   лу.25=60=40 лу.50=60=40  лу.75=60=40    ко=60:~.75=6:v60:*ed $guit*edm
#$____: 720   180                                     ко=0=90:~.75=6 $organ*r
$guit: 960   лу=60 лу=60  ло.25=60:v60:*ed  лу=60         $guit*edm
$guit: 1200  лу=60 лу=60  ло.50=60:v60:*ed  лу=60         $guit*edm
$guit: 1440  лу=60 лу=60  ло.75=60:v60:*ed  лу=60         $guit*edm
$guit: 1680  до=60=240 до.10=60=180:v30 мо=60=120:v30 бу=60:v30 $guit*ed

<интро_гит2 b150 $>
$guit: 0  до=60=240 до.25=60=180:v30 мо=60=120:v30 бу=60:v30 $guit*ed

<интро_гит2 b150 $>
$guit: 0  до=60=240 до.25=60=180:v30 мо=60=120:v30 бу=60:v30 $guit*ed

# ACFE DCBA D#DEF EEEE
<SOLO1 b150 set>
solo1_1 #  ACFE
solo1_2 #  DCBA
solo1_3 #  D#DEF
solo1_4 #  EEEE

# ACFE DCBA D#DEF A
<SOLO2 b150 set>
solo1_1 #  ACFE
solo1_2 #  DCBA
solo2_3 #  D#DEF
solo2_4 #  A

# CEAG FEDD GGAB CDEC
<SOLO3 b150 set>
solo3_1 #  CEAG
solo3_2 #  FEDD
solo3_3 #  GGAB
solo3_4 #  CDEC

# FED#F GFE#G AAD#F EEEE EEDcBa EEEE EEDcBa #Gf E#d Ed Cb
<SOLO4 b150 set>
solo4_1 # FED#F
solo4_2 # GFE#G
solo4_3 # AAD#F
solo4_4 # EEEE
solo4_5 # EEDcBa
solo4_4 # EEEE
solo4_5 # EEDcBa
solo4_6 # #Gf E#d Ed Cb

# ACFE DCBA DDEE F#CDE #FA#GE AEFC D#DEE A
<SOLO5 b150 set>
solo5_1 # ACFE
solo5_2 # DCBA
solo5_3 # DDEE
solo5_4 # F#CDE
solo5_6 # #FA#GE
solo5_7 # AEFC
solo5_8 # D#DEE
solo5_9 # A

<solo5_9 b150 $>
# A
$____: 0      ЛУ=960:~.75=48 $organ*r
$guit: 0      лу=60 ло=60 да=60 ма=60  фа=60 ма=60 на=60 ма=60 ла=240:*ed $guit*edm
$bass: 0      лы=960 $cBass*s

<solo5_8 b150 $>
# D#DEE
$____: 0      РО=240 $organ*r
$bass: 0      ру=240 $cBass*s
$guit: 0      ро=60=240:*ed:v40 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 240    НО=240 $organ*r
$bass: 240    ну=240 $cBass*s
$guit: 240    но=60=240:*ed:v40 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 480    МО=240 $organ*r
$bass: 480    му=240 $cBass*s
$guit: 480    мо=60=240:*ed:v40 v60 ло=60 ма=60 ло=60 $guit*edm
$____: 720    МУ=240 $organ*r
$bass: 720    мы=240 $cBass*s
$guit: 720    му=60=240:*ed:v40 v60 зо=60 бо=60 ма=60 $guit*edm

<solo5_7 b150 $>
# AEFC
$____: 0      ЛО=240 $organ*r
$bass: 0      лу=240 $cBass*s
$guit: 0      ло=60=240:*ed:v40 v60 да=60 да=60 да=60 $guit*edm
$____: 240    МО=240 $organ*r
$bass: 240    му=240 $cBass*s
$guit: 240    мо=60=240:*ed:v40 v60 бо=60 бо=60 бо=60 $guit*edm
$____: 480    ФО=240 $organ*r
$bass: 480    фу=240 $cBass*s
$guit: 480    фо=60=240:*ed:v40 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 720    ДО=240 $organ*r
$bass: 720    ду=240 $cBass*s
$guit: 720    до=60=240:*ed:v40 v60 ло=60 да=60 ло=60 $guit*edm


<solo5_6 b150 $>
# #FA#GE
$____: 0      ВО=240 $organ*r
$bass: 0      ву=240 $cBass*s
$guit: 0      во=60=240:*ed:v40 v60 на=60 на=60 на=60 $guit*edm
$____: 240    ЛО=240 $organ*r
$bass: 240    лу=240 $cBass*s
$guit: 240    ло=60=240:*ed:v40 v60 на=60 на=60 на=60 $guit*edm
$____: 480    ЗО=240 $organ*r
$bass: 480    зу=240 $cBass*s
$guit: 480    зо=60=240:*ed:v40 v60 ма=60 ма=60 ма=60 $guit*edm
$____: 720    МО=240 $organ*r
$bass: 720    му=240 $cBass*s
$guit: 720    мо=60=240:*ed:v40 v60 ра=60 ра=60 ра=60 $guit*edm


<solo5_4 b150 $>
# F#CDE
$____: 0      ФО=240 $organ*r
$bass: 0      фу=240 $cBass*s
$guit: 0      фо=60=240:*ed:v40 v60 ло=60 ра=60 ло=60 $guit*edm
$____: 240    ТО=240 $organ*r
$bass: 240    ту=240 $cBass*s
$guit: 240    то=60=240:*ed:v40 v60 ло=60 ма=60 ло=60 $guit*edm
$____: 480    РО=240 $organ*r
$bass: 480    ру=240 $cBass*s
$guit: 480    ро=60=240:*ed:v40 v60 ло=60 фа=60 ло=60 $guit*edm
$____: 720    МО=240 $organ*r
$bass: 720    му=240 $cBass*s
$guit: 720    мо=60=240:*ed:v40 v60 ло=60 ма=60 ло=60 $guit*edm


<solo5_3 b150 $>
# DDEE
$____: 0      РО=240 $organ*r
$bass: 0      ру=240 $cBass*s
$guit: 0      ро=60=240:*ed:v40 v60 фо=60 ко=60 фо=60 $guit*edm
$____: 240    РО=240 $organ*r
$bass: 240    ру=240 $cBass*s
$guit: 240    ро=60=240:*ed:v40 v60 фо=60 ко=60 фо=60 $guit*edm
$____: 480    МО=240 $organ*r
$bass: 480    му=240 $cBass*s
$guit: 480    мо=60=240:*ed:v40 v60 со=60 та=60 со=60 $guit*edm
$____: 720    МО=240 $organ*r
$bass: 720    му=240 $cBass*s
$guit: 720    мо=60=240:*ed:v40 v60 со=60 та=60 со=60 $guit*edm


<solo5_2 b150 $>
# DCBA
$____: 0      ро=240 $organ*r
$bass: 0      РУ=240 $cBass*s
$guit: 0      ро=60=240:*ed:v40 v60 ло=60 фа=60 ло=60 $guit*edm
$____: 240    до=240 $organ*r
$bass: 240    ДУ=240 $cBass*s
$guit: 240    до=60=240:*ed:v40 v60 ло=60 ма=60 ло=60 $guit*edm
$____: 480    бу=240 $organ*r
$bass: 480    БЫ=240 $cBass*s
$guit: 480    бу=60=240:*ed:v40 v60 зо=60 ра=60 зо=60 $guit*edm
$____: 720    лу=240 $organ*r
$bass: 720    ЛЫ=240 $cBass*s
$guit: 720    лу=60=240:*ed:v40 v60 ло=60 да=60 ло=60 $guit*edm

<solo5_1 b150 $>
# ACFE
$____: 0    ЛУ=240 $organ*r
$bass: 0    лы=240 $cBass*s
$guit: 0    лу=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 240  ДО=240 $organ*r
$bass: 240  ду=240 $cBass*s
$guit: 240  до=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 480  ФО=240 $organ*r
$bass: 480  фу=240 $cBass*s
$guit: 480  фо=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 720  МО=240 $organ*r
$bass: 720  му=240 $cBass*s
$guit: 720  мо=60=70 v60 ло=60 ло=60 ло=60 $guit*edm

<solo4_6 b150 $>
# EEEE 
$____: 0    ЗО=120:v70:~.75=12 ФО=60 ма=60 $organ*r
$bass: 0    зу=120 фу=120 $cBass*s
$guit: 0    зо=120 фо=60 ма=60 $guit*edm
$____: 240  МО=60 ма=60  НО=60 ма=60 $organ*r
$bass: 240  му=120       ну=120 $cBass*s
$guit: 240  мо=60  ма=60 но=60 ма=60 $guit*edm
$____: 480  МО=60 ма=60 РО=60 ма=60 $organ*r
$bass: 480  му=120      ру=120 $cBass*s
$guit: 480  мо=60 ма=60 ро=60 ма=60 $guit*edm
$____: 720  ДО=60 ма=60 БУ=60 ма=60 $organ*r
$bass: 720  ду=120      бы=120 $cBass*s
$guit: 720  до=60 ма=60 бу=60 ма=60 $guit*edm


<solo4_5 b150 $>
# EEEE 
$____: 0    МО=240 $organ*r
$bass: 0    му=240 $cBass*s
$guit: 0    ла=60=70 v60 ма=60 ма=60 ма=60 $guit*edm
$____: 240  МО=240 $organ*r
$bass: 240  му=240 $cBass*s
$guit: 240  фа=60 ма=60 на=60 ма=60 $guit*edm
$____: 480  РО=120 ДО=120 $organ*r
$bass: 480  ру=120 ду=120 $cBass*s
$guit: 480  ра=60 ма=60 да=60 ма=60 $guit*edm
$____: 720  БУ=120 ЛУ=120 $organ*r
$bass: 720  бы=120 лы=120 $cBass*s
$guit: 720  бо=60 ма=60 ло=60 ма=60 $guit*edm


<solo4_4 b150 $>
# EEEE ММММ
$____: 0    МО=240 $organ*r
$bass: 0    му=240 $cBass*s
$guit: 0    мо=60=70 v60 зо=60 бо=60 ма=60 $guit*edm
$____: 240  МО=240 $organ*r
$bass: 240  му=240 $cBass*s
$guit: 240  фа=60 ма=60 ма=60 ма=60 $guit*edm
$____: 480  МО=240 $organ*r
$bass: 480  му=240 $cBass*s
$guit: 480  за=60 ма=60 ма=60 ма=60 $guit*edm
$____: 720  МО=240 $organ*r
$bass: 720  му=240 $cBass*s
$guit: 720  ба=60 ма=60 ма=60 ма=60 $guit*edm


<solo4_3 b150 $>
# AADF# ЛЛРВ 
$____: 0    ЛО=240 $organ*r
$bass: 0    лу=240 $cBass*s
$guit: 0    ло=60=70 v60 да=60 да=60 да=60 $guit*edm
$____: 240  ЛУ=240 $organ*r
$bass: 240  лы=240 $cBass*s
$guit: 240  лу=60=70 v60 да=60 да=60 да=60 $guit*edm
$____: 480  РО=240 $organ*r
$bass: 480  ру=240 $cBass*s
$guit: 480  ро=60=70 v60 бо=60 бо=60 бо=60 $guit*edm
$____: 720  ВО=240 $organ*r
$bass: 720  ву=240 $cBass*s
$guit: 720  во=60=70 v60 ло=60 ло=60 ло=60 $guit*edm


<solo4_2 b150 $>
# GFE#G СФМЗ
$____: 0    СО=240 $organ*r
$bass: 0    су=240 $cBass*s
$guit: 0    со=60=70 v60 бо=60 бо=60 бо=60 $guit*edm
$____: 240  ФО=240 $organ*r
$bass: 240  фу=240 $cBass*s
$guit: 240  фо=60=70 v60 на=60 на=60 на=60 $guit*edm
$____: 480  МО=240 $organ*r
$bass: 480  му=240 $cBass*s
$guit: 480  мо=60=70 v60 ма=60 ма=60 ма=60 $guit*edm
$____: 720  ЗО=240 $organ*r
$bass: 720  зу=240 $cBass*s
$guit: 720  зо=60=70 v60 ра=60 ра=60 ра=60 $guit*edm


<solo4_1 b150 $>
# FED#F ФМРВ
$____: 0    ФО=240 $organ*r
$bass: 0    фу=240 $cBass*s
$guit: 0    фо=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 240  МО=240 $organ*r
$bass: 240  му=240 $cBass*s
$guit: 240  мо=60=70 v60 та=60 та=60 та=60 $guit*edm
$____: 480  РО=240 $organ*r
$bass: 480  ру=240 $cBass*s
$guit: 480  ро=60=70 v60 ра=60 ра=60 ра=60 $guit*edm
$____: 720  ВО=240 $organ*r
$bass: 720  ву=240 $cBass*s
$guit: 720  во=60=70 v60 да=60 да=60 да=60 $guit*edm



<solo3_4 b150 $>
# CDEC
$____: 0    ДО=240 $organ*r
$bass: 0    ду=240 $cBass*s
$guit: 0    до=60=70 v60 со=60 ма=60:*ed со=60 $guit*edm
$____: 240  РО=240 $organ*r
$bass: 240  ру=240 $cBass*s
$guit: 240  ро=60=70 v60 со=60 ра=60:*ed со=60 $guit*edm
$____: 480  МО=240 $organ*r
$bass: 480  му=240 $cBass*s
$guit: 480  мо=60=70 v60 со=60 да=60:*ed со=60 $guit*edm
$____: 720  ДО=240 $organ*r
$bass: 720  ду=240 $cBass*s
$guit: 720  до=60=70 v60 со=60 ма=60:*ed со=60 $guit*edm


<solo3_3 b150 $>
# GGAB
$____: 0    СУ=240 $organ*r
$bass: 0    су=240 $cBass*s
$guit: 0    со=60=70 v60 бо=60 са=60:*ed со=60 $guit*edm
$____: 240  СУ=240 $organ*r
$bass: 240  сы=240 $cBass*s
$guit: 240  су=60=70 v60 со=60 са=60:*ed со=60 $guit*edm
$____: 480  ЛУ=240 $organ*r
$bass: 480  лу=240 $cBass*s
$guit: 480  лу=60=70 v60 со=60 ва=60:*ed со=60 $guit*edm
$____: 720  БУ=240 $organ*r
$bass: 720  бы=240 $cBass*s
$guit: 720  бу=60=70 v60 со=60 фа=60:*ed со=60 $guit*edm

<solo3_2 b150 $>
# FEDD
$____: 0    ФУ=240 $organ*r
$bass: 0    фу=240 $cBass*s
$guit: 0    фо=60=70 v60 ло=60:*ed ра=60 ло=60 $guit*edm
$____: 240  МО=240 $organ*r
$bass: 240  му=240 $cBass*s
$guit: 240  мо=60=70 v60 та=60 ма=60:*ed та=60 $guit*edm
$____: 480  РО=240 $organ*r
$bass: 480  ру=240 $cBass*s
$guit: 480  ро=60=70 v60 ра=60 фа=60 ра=60:*ed $guit*edm
$____: 720  РО=240 $organ*r
$bass: 720  ру=240 $cBass*s
$guit: 720  ро=60=70 v60 да=60 ва=60:*ed да=60 $guit*edm


<solo3_1 b150 $>
# CEAG
$____: 0    ДО=240 $organ*r
$bass: 0    ду=240 $cBass*s
$guit: 0    до=60=70 v60 да=60 да=60 да=60 $guit*edm
$____: 240  МО=240 $organ*r
$bass: 240  му=240 $cBass*s
$guit: 240  мо=60=70 v60 да=60 да=60 да=60 $guit*edm
$____: 480  ЛО=240 $organ*r
$bass: 480  лу=240 $cBass*s
$guit: 480  ло=60=70 v60 да=60 да=60 да=60 $guit*edm
$____: 720  СО=240 $organ*r
$bass: 720  су=240 $cBass*s
$guit: 720  со=60=70 v60 да=60 да=60 да=60 $guit*edm


<solo1_1 b150 $>
# ACFE
$____: 0    ЛУ=240 $organ*r
$bass: 0    лы=240 $cBass*s
$guit: 0    лу=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 240  ДО=240 $organ*r
$bass: 240  ду=240 $cBass*s
$guit: 240  до=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 480  ФО=240 $organ*r
$bass: 480  фу=240 $cBass*s
$guit: 480  фо=60=70 v60 ло=60 ло=60 ло=60 $guit*edm
$____: 720  МО=240 $organ*r
$bass: 720  му=240 $cBass*s
$guit: 720  мо=60=70 v60 ло=60 ло=60 ло=60 $guit*edm

<solo1_2 b150 $>
# DCBA
$____: 0      ро=240 $organ*r
$bass: 0      РУ=240 $cBass*s
$guit: 0      ро=60=240:*ed:v40 v60 ло=60 фа=60 ло=60 $guit*edm
$____: 240    до=240 $organ*r
$bass: 240    ДУ=240 $cBass*s
$guit: 240    до=60=240:*ed:v40 v60 ло=60 ма=60 ло=60 $guit*edm
$____: 480    бу=240 $organ*r
$bass: 480    БЫ=240 $cBass*s
$guit: 480    бу=60=240:*ed:v40 v60 зо=60 ра=60 зо=60 $guit*edm
$____: 720    лу=240 $organ*r
$bass: 720    ЛЫ=240 $cBass*s
$guit: 720    лу=60=240:*ed:v40 v60 ло=60 да=60 ло=60 $guit*edm

<solo1_3 b150 $>
# D#DEF
$____: 0      ро=240 $organ*r
$bass: 0      ру=240 $cBass*s
$guit: 0      ро=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 240    НО=240 $organ*r
$bass: 240    ну=240 $cBass*s
$guit: 240    но=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 480    МО=240 $organ*r
$bass: 480    му=240 $cBass*s
$guit: 480    мо=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 720    ФО=240 $organ*r
$bass: 720    фу=240 $cBass*s
$guit: 720    фо=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm

<solo1_4 b150 $>
# EEEE
$____: 0    мо=240 $organ*r
$bass: 0    МУ=240 $cBass*s
$guit: 0    мо=60=240:*ed:v30 v60 ло=60 да=60 ло=60 $guit*edm
$____: 240  му=240 $organ*r
$bass: 240  мы=240 $cBass*s
$guit: 240  му=60=240:*ed:v30 v60 ло=60 да=60 ло=60 $guit*edm
$____: 480  мо=240 $organ*r
$bass: 480  МУ=240 $cBass*s
$guit: 480  мо=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 720  му=0=240 120 ма=120 $organ*r
$bass: 720  МЫ=240 $cBass*s
$guit: 720  му=60=240:*ed:v30 v60 зо=60 ма=60 зо=60 $guit*edm

<solo2_4 b150 $>
# A
$____: 0      ЛУ=960:~.75=48 $organ*r
$guit: 0      лу=60 ло=60 да=60 ма=60 фа=60 ма=60 на=60 ма=60 ла=240:*ed $guit*edm
$bass: 0      лы=960 $cBass*s

<solo2_3 b150 $>
# D#DEF
$____: 0      ро=240 $organ*r
$bass: 0      ру=240 $cBass*s
$guit: 0      ро=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 240    НО=240 $organ*r
$bass: 240    ну=240 $cBass*s
$guit: 240    но=60=240:*ed:v30 v60 ло=60 бо=60 ло=60 $guit*edm
$____: 480    МО=240 $organ*r
$bass: 480    му=240 $cBass*s
$guit: 480    мо=60=240:*ed:v30 v60 ло=60 да=60 ло=60 $guit*edm
$____: 720    МУ=240 $organ*r
$bass: 720    мы=240 $cBass*s
$guit: 720    му=60=240:*ed:v30 v60 зо=60 бо=60 ма=60 $guit*edm

<roseOut b130>
> rose1
> rose2
> rose1
> rose3


# дТ фВ сЗ
<rose3 b130 $>
$bass: 0   ту=60 ту=60 60 ту=60  $cBass*f
$guit: 0   то=120 120 $guit*ed
$bass: 240 ту=60 ту=60 60 ту=60  $cBass*f
$guit: 240 зу=60 60 лу=120 $guit*ed
$bass: 480 ту=60 ту=60 60 ту=60  $cBass*f
$guit: 480 120 ву=60 60 $guit*ed
$bass: 720 ту=60 ту=60 му=120  $cBass*f
$guit: 720 зу=120 120 $guit*ed

# дТ фВ сЗ
<rose2 b130 $>
$bass: 0   ту=60 ту=60 60 ту=60  $cBass*f
$guit: 0   то=120 120 $guit*ed
$bass: 240 ту=60 ту=60 60 ту=60  $cBass*f
$guit: 240 зу=60 60 лу=120 $guit*ed
$bass: 480 ту=60 ту=60 60 ту=60  $cBass*f
$bass: 720 ту=60 ту=60 60 ту=60  $cBass*f


<rose1 b130 $>
$bass: 0   ту=60 ту=60 60 ту=60  $cBass*f
$bass: 240 ту=60 ту=60 60 ту=60  $cBass*f
$bass: 480 ту=60 ту=60 60 ту=60  $cBass*f
$bass: 720 ту=60 ту=60 60 ту=60  $cBass*f







<tick b130 $>
$tick: бе=120 бе=120 бе=120 бе=120 $xylo




<grandson6 b130>
> grandson6_guit_1
> grandson6_guit_1

# cl-1, cr-1, crt-1, crl-1, dr-2, drs-3, drp-1, drpm-1

<grandson6_cr b150 $>
$egit: 0    $egit*cr1   бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 1920 $egit*crt1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 3840 $egit*crl1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120

<grandson6_dr b150 $>
$egit: 0    $egit*dr1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 1920 $egit*dr2  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 3840 $egit*drp1 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120

<grandson6_drs b150 $>
$egit: 0    $egit*drs1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 1920 $egit*drs2  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 3840 $egit*drs3  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120

<grandson6_drm b150 $>
$egit: 0    $egit*drpm1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120

# dn-5, dnt-1, dns-4, dfl-4
<grandson6_dn b150 $>
$egit: 0    $egit*dnt1  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 1920 $egit*dn2  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120
$egit: 3840 $egit*dn3 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 бо=120=40 бо=120=40 бо=120=40 бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 бо=120=40 ло=120=40 со=120    во=120



<grandson6_guit_1 b150 $>
$guit: 0    бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 $egit*cr1
$guit: 480  бо=120=40 бо=120=40 бо=120=40 бо=120=40   $egit*cr1
$guit: 960  бы=120=60 бы=120 ра=120 бо=40 ло=40 лу=40 $egit*cr1
$guit: 1440 бо=120=40 ло=120=40 со=120    во=120      $egit*cr1
#      1920

#https://www.songsterr.com/a/wsa/laid-back-baker-man-tab-s41225t0
<power2 b110 $>
$guit: 0    [РЬ_Р_РРР] ру=90=60 ру=90=60 ру=120=60 му.75=120_60_.-75=60=15 ру=60 $egit*dn5
$guit: 480  [РЬ_РЬ_РР] до=90_45_.75=45=15 ро=90=95 су=90_45_.75=45=15 лу=90=95 му=120_60_.50=60=15 $egit*dn5
$guit: 960  [РЬ_Р_РРР] ру=90=60 ру=90=60 ру=120=60 му.75=120_60_.-75=60=15 ру=60 $egit*dn5
$guit: 1440 [РЬ_РЬ_РР] да=90_45_.50=45=15 ра=90=95 со=90_45_.75=45=15 ло=90=95 фо=120 $egit*dn5


<power b110 $>
$guit: 0    [РЬ_Р_РРР] ру=90=60 ру=90=60 ру=120=60 му.75=120_60_.-75=60=15 ру=60 $egit*dn5
$guit: 480  [РЬ_РЬ_РР] до=90_45_.75=45=15 ро=90=95 су=90_45_.75=45=15 лу=90=95 му=120_60_.50=60=15 $egit*dn5
$guit: 960  [РЬ_Р_РРР] ру=90=60 ру=90=60 ру=120=60 му.75=120_60_.-75=60=15 ру=60 $egit*dn5
$guit: 1440 [РЬ_РЬ_РР] да=90_45_.50=45=15 ра=90=95 со=90_45_.75=45=15 ло=90=95 фо=120 $egit*dn5

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
  dynamic
};
