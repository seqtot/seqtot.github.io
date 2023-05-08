
let metaTag=document.createElement('meta');
metaTag.name = "viewport"
//<meta name="viewport" content="width=device-width, user-scalable=no">
//metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
//metaTag.content = "width=device-width, initial-scale=1.0, user-scalable=no"
metaTag.content = "width=device-width, user-scalable=no";
document.getElementsByTagName('head')[0].appendChild(metaTag);

import 'framework7-icons/css/framework7-icons.css';
import 'framework7/framework7-bundle.min.css';
import './src/style.css';

import './src/app';
