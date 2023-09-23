// https://www.svgrepo.com

const svgIconBtnStl = [
    `display: inline-block;`,
    `border: 1px solid lightgray; border-radius: 0.25rem;`,
    `line-height: 0;`,
    `user-select: none;`,
    `padding: 0; margin: 0; margin-right: .4rem;`,
].join('');

export function plusBtn(data: string, color= 'green', size= 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'green';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="${size}px" height="${size}px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: ${color};"
            >
                <rect x="2" y="8" width="16" height="4"></rect>                
                <rect x="8" y="2" width="4" height="16"></rect>                        
            </svg>
        </span>`.trim();
}

export function minusBtn(data: string, color= 'red', size= 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'red';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="${size}px" height="${size}px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: ${color};"
            >
                <rect x="2" y="8" width="16" height="4"></rect>                        
            </svg>
        </span>`.trim();
}

export function noteBtn(data: string, color= 'blue') {
    data = (data || '').trim();

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: ${color};"                
            >
                <path d="M9.78103 1.69759C14.1038 4.63512 16.25 6.76176 16.25 8.30413C16.25 9.79646 15.4291 11.0034 13.8541 11.8872C13.418 12.132 12.9324 11.6555 13.1688 11.2148C13.5756 10.4565 13.4416 9.60793 12.7079 8.59803C11.934 7.53285 10.8174 6.75731 9.34301 6.26969C9.13826 6.20198 9 6.01063 9 5.79498V2.11114C9 1.70978 9.44906 1.47201 9.78103 1.69759Z"/>
                <path d="M7.75 17.75C5.97914 17.75 4.5 16.607 4.5 15.125C4.5 13.643 5.97914 12.5 7.75 12.5C9.52086 12.5 11 13.643 11 15.125C11 16.607 9.52086 17.75 7.75 17.75Z"/>
                <path d="M10 4C10.5523 4 11 4.44772 11 5V15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15V5C9 4.44772 9.44772 4 10 4Z"/>
            </svg>
        </span>`.trim();
}

export function copyBtn(data: string, color= 'black') {
    data = (data || '').trim();

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                        
            >
                <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z"/>
            </svg>
        </span>`.trim();
}

export function copyManyBtn(data: string, color= 'black') {
    data = (data || '').trim();

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"            
            >
                <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z"/><path d="M6 12h6v2H6zm0 4h6v2H6z"/>
            </svg>
        </span>`.trim();
}

export function pasteBtn(data: string, color= 'black') {
    data = (data || '').trim();

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M22.6,4H21.55a3.89,3.89,0,0,0-7.31,0H13.4A2.41,2.41,0,0,0,11,6.4V10H25V6.4A2.41,2.41,0,0,0,22.6,4ZM23,8H13V6.25A.25.25,0,0,1,13.25,6h2.69l.12-1.11A1.24,1.24,0,0,1,16.61,4a2,2,0,0,1,3.15,1.18l.09.84h2.9a.25.25,0,0,1,.25.25Z" class="clr-i-outline clr-i-outline-path-1"></path><path d="M33.25,18.06H21.33l2.84-2.83a1,1,0,1,0-1.42-1.42L17.5,19.06l5.25,5.25a1,1,0,0,0,.71.29,1,1,0,0,0,.71-1.7l-2.84-2.84H33.25a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-2"></path><path d="M29,16h2V6.68A1.66,1.66,0,0,0,29.35,5H27.08V7H29Z" class="clr-i-outline clr-i-outline-path-3"></path><path d="M29,31H7V7H9V5H6.64A1.66,1.66,0,0,0,5,6.67V31.32A1.66,1.66,0,0,0,6.65,33H29.36A1.66,1.66,0,0,0,31,31.33V22.06H29Z" class="clr-i-outline clr-i-outline-path-4"></path>
                <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
            </svg>
        </span>`.trim();
}

export function renameBtn(data: string, color= 'black', size= 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
             <svg 
                width="${size}px" height="${size}px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"
            >
                 <g id="Page-1" stroke="none" stroke-width="1">
                    <g id="Combined-Shape" fill="#000000" transform="translate(42.666667, 64.000000)">
                        <path d="M362.666667,1.42108547e-14 L362.666667,21.3333333 L320,21.333 L320,362.666 L362.666667,362.666667 L362.666667,384 L320,383.999 L320,384 L298.666667,384 L298.666,383.999 L256,384 L256,362.666667 L298.666,362.666 L298.666,21.333 L256,21.3333333 L256,1.42108547e-14 L362.666667,1.42108547e-14 Z M426.666667,64 L426.666667,320 L341.333333,320 L341.333333,277.333333 L384,277.333333 L384,106.666667 L341.333333,106.666667 L341.333333,64 L426.666667,64 Z M277.333333,64 L277.333333,320 L3.55271368e-14,320 L3.55271368e-14,64 L277.333333,64 Z M179.2,89.6 L149.333333,89.6 L149.333333,234.666667 C149.333333,248 148.5,256.333333 147.875,264.354167 L147.792993,265.422171 L147.792993,265.422171 L147.714003,266.48894 C147.417695,270.579012 147.2,274.696296 147.2,279.466667 L147.2,279.466667 L177.066667,279.466667 L177.066667,260.266667 C184.941497,273.926888 199.708077,282.130544 215.466667,281.6 C229.540046,281.805757 242.921593,275.508559 251.733333,264.533333 C263.162478,248.989677 269.832496,230.461848 270.933333,211.2 C270.933333,170.666667 249.6,142.933333 217.6,142.933333 C202.507405,142.999748 188.308689,150.099106 179.2,162.133333 L179.2,162.133333 L179.2,89.6 Z M119.466667,162.133333 C107.961824,149.843793 91.4322333,143.546807 74.6666667,145.066667 C57.6785115,144.485924 40.8138255,148.15216 25.6,155.733333 L25.6,155.733333 L34.1333333,177.066667 C45.3979052,171.147831 57.7246848,167.522308 70.4,166.4 C78.5613135,165.511423 86.6853595,168.371259 92.4903835,174.176283 C98.2954074,179.981307 101.155244,188.105353 100.266667,196.266667 L100.266667,196.266667 L100.266667,198.4 L78.9333333,198.4 C65.8181975,197.679203 52.705771,199.864608 40.5333333,204.8 C26.2806563,210.950309 17.6507691,225.621117 19.2,241.066667 C19.0625857,252.057651 23.6679763,262.574827 31.8381493,269.927982 C40.0083223,277.281138 50.9508304,280.757072 61.8666667,279.466667 C77.2795695,280.291768 92.2192911,274.001359 102.4,262.4 L102.4,262.4 L102.4,277.333333 L130.133333,277.333333 C128.292479,266.054406 127.577851,254.620365 128,243.2 L128,243.2 L128,204.8 C129.999138,190.023932 126.995128,175.003882 119.466667,162.133333 Z M98.1333333,213.333333 L98.1333333,238.933333 C92.082572,249.988391 80.836024,257.218314 68.2666667,258.133333 C63.0655139,258.520242 57.9538681,256.621996 54.2659359,252.934064 C50.5780036,249.246132 48.6797582,244.134486 49.0666667,238.933333 C49.0666667,224 59.7333333,215.466667 85.3333333,213.333333 L85.3333333,213.333333 L98.1333333,213.333333 Z M209.066667,166.4 C226.133333,166.4 238.933333,183.466667 238.933333,211.2 C238.933333,238.933333 228.266667,256 211.2,256 C197.298049,255.69869 184.825037,247.383349 179.2,234.666667 L179.2,234.666667 L179.2,187.733333 C185.154203,176.240507 196.263981,168.304951 209.066667,166.4 Z">
                        </path>
                    </g>
                 </g>
             </svg>
        </span>`.trim();
}

export function checkBtn(data: string, color= 'black', size = 20 ) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="fill: none; stroke: ${color};"                
            >
                <path
                    id="Vector" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                    d="M8 12L11 15L16 9M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
                 />
            </svg>
        </span>`.trim();
}

export function uncheckBtn(data: string, color= 'black', size = 20 ) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="fill: none; stroke: ${color};"                
            >
                <g id="Interface / Checkbox_Unchecked">
                    <path 
                        id="Vector" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                        d="M4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V7.19691C20 6.07899 20 5.5192 19.7822 5.0918C19.5905 4.71547 19.2837 4.40973 18.9074 4.21799C18.4796 4 17.9203 4 16.8002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002Z"
                    />
                </g>
            </svg>
        </span>`.trim();
}

export function editBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696L175.168 732.8zM455.04 229.248l193.92 112 56.704-98.112-193.984-112-56.64 98.112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336L104.32 708.8zm384 254.272v-64h448v64h-448z" />
            </svg>
        </span>`.trim();
}


export function moveLeftBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="-8.5 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M7.094 15.938l7.688 7.688-3.719 3.563-11.063-11.063 11.313-11.344 3.531 3.5z"></path>
            </svg>
        </span>`.trim();
}

export function moveRightBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="-8.5 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M7.75 16.063l-7.688-7.688 3.719-3.594 11.063 11.094-11.344 11.313-3.5-3.469z"></path>
            </svg>
        </span>`.trim();
}

export function moveTopBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="-5 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M11.25 15.688l-7.656 7.656-3.594-3.688 11.063-11.094 11.344 11.344-3.5 3.5z"></path>
            </svg>
        </span>`.trim();
}

export function moveDownBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="-5 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M11.125 16.313l7.688-7.688 3.594 3.719-11.094 11.063-11.313-11.313 3.5-3.531z"></path>
            </svg>
        </span>`.trim();
}


export function copyPasteBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M15,13h2v2h-2v2h-2v-2h-2v-2h2v-2h2V13z M27,7v2v20H9v-4H5V3h18v4H27z M21,23V5H7v18H21z M25,9 h-2v16H11v2h14V9z"/>
            </svg>
        </span>`.trim();
}


export function deleteBtn(data: string, color= 'red', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'red';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M48,0A48,48,0,1,0,96,48,48.0512,48.0512,0,0,0,48,0Zm0,84A36,36,0,1,1,84,48,36.0393,36.0393,0,0,1,48,84Z"/>
                <path d="M64.2422,31.7578a5.9979,5.9979,0,0,0-8.4844,0L48,39.5156l-7.7578-7.7578a5.9994,5.9994,0,0,0-8.4844,8.4844L39.5156,48l-7.7578,7.7578a5.9994,5.9994,0,1,0,8.4844,8.4844L48,56.4844l7.7578,7.7578a5.9994,5.9994,0,0,0,8.4844-8.4844L56.4844,48l7.7578-7.7578A5.9979,5.9979,0,0,0,64.2422,31.7578Z"/>
            </svg>
        </span>`.trim();
}

export function playBtn(data: string, color= 'blue', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'blue';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
            </svg>
        </span>`.trim();
}

export function stopBtn(data: string, color= 'gray', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'gray';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h16.128q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-16.128q-0.832 0-1.44 0.576t-0.576 1.44v16.16z"></path>
            </svg>
        </span>`.trim();
}

export function playLoopBtn(data: string, color= 'blue', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'blue';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <g>
                    <path d="M83.729,23.57c-0.007-0.562-0.32-1.084-0.825-1.337c-0.503-0.259-1.107-0.212-1.568,0.114l-5.944,4.262l-0.468,0.336 c-6.405-6.391-15.196-10.389-24.938-10.389c-13.284,0-24.878,7.354-30.941,18.201l0.024,0.013 c-0.548,1.183-0.124,2.607,1.026,3.271c0.001,0,0.001,0,0.002,0.001l8.136,4.697c1.218,0.704,2.777,0.287,3.48-0.932 c0.006-0.011,0.009-0.023,0.015-0.034c3.591-6.404,10.438-10.747,18.289-10.747c4.879,0,9.352,1.696,12.914,4.5l-1.001,0.719 l-5.948,4.262c-0.455,0.327-0.696,0.89-0.611,1.447c0.081,0.558,0.471,1.028,1.008,1.208l25.447,8.669 c0.461,0.162,0.966,0.084,1.367-0.203c0.399-0.29,0.629-0.746,0.627-1.23L83.729,23.57z"/>
                    <path d="M79.904,61.958c0,0-0.001,0-0.002-0.001l-8.136-4.697c-1.218-0.704-2.777-0.287-3.48,0.932 c-0.006,0.011-0.009,0.023-0.015,0.034c-3.591,6.404-10.438,10.747-18.289,10.747c-4.879,0-9.352-1.696-12.914-4.5l1.001-0.719 l5.948-4.262c0.455-0.327,0.696-0.89,0.611-1.447c-0.081-0.558-0.471-1.028-1.008-1.208l-25.447-8.669 c-0.461-0.162-0.966-0.084-1.367,0.203c-0.399,0.29-0.629,0.746-0.627,1.23l0.092,26.828c0.007,0.562,0.32,1.084,0.825,1.337 c0.503,0.259,1.107,0.212,1.568-0.114l5.944-4.262l0.468-0.336c6.405,6.391,15.196,10.389,24.938,10.389 c13.284,0,24.878-7.354,30.941-18.201L80.93,65.23C81.478,64.046,81.055,62.623,79.904,61.958z"/>
                </g>
            </svg>
        </span>`.trim();
}

export function insertLineBtn(data: string, color= 'black', size= 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="${size}px" height="${size}px" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: none;"
            >
                <rect x="10" y="10" width="100" height="10" fill="gray"></rect>
                <rect x="10" y="50" width="50"  height="10"></rect>                
                <rect x="10" y="90" width="100" height="10" fill="gray"></rect>
                
                <rect x="70" y="50" width="40" height="15" fill="green"></rect>                
                <rect x="82" y="37" width="15" height="40" fill="green"></rect>
                                                
            </svg>
        </span>`.trim();
}

export function addLineBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: none;"                
            >
                <rect x="10" y="10" width="100" height="10" fill="gray"></rect>
                <rect x="60" y="50" width="50"  height="10" fill="gray"></rect>                
                <rect x="10" y="90" width="100" height="10"></rect>
                
                <rect x="10" y="50" width="40" height="15" fill="green"></rect>                
                <rect x="22" y="37" width="15" height="40" fill="green"></rect>
            </svg>
        </span>`.trim();
}

export function deleteLineBtn(data: string, color= 'black', size= 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg
                width="${size}px" height="${size}px" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color}; stroke: none;"
            >
                <rect x="10" y="10" width="100" height="10" fill="gray"></rect>
                <rect x="10" y="50" width="50"  height="10" fill="gray"></rect>                
                <rect x="10" y="90" width="100" height="10" fill="gray"></rect>
                
                <rect x="70" y="48" width="40" height="20" fill="red"></rect>                                                
            </svg>
        </span>`.trim();
}

export function instrumentBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 498.341 498.341" xmlns="http://www.w3.org/2000/svg"
                style="fill: ${color};"                
            >
                <g>
                    <g>
                        <path d="M492.293,158.605c-30.763-52.48-87.019-105.707-151.125-142.955c-8.149-6.315-19.008-7.829-28.736-3.776 c-10.709,4.501-17.536,14.933-17.429,26.368l0.128,73.792c0.384,21.547,0.192,34.176-7.531,42.048 c-2.005,1.771-202.56,178.667-271.296,244.011c-10.347,9.813-16.128,23.083-16.299,37.312 c-0.192,14.293,5.291,27.755,15.424,37.888h0.021c10.261,10.283,23.701,15.424,37.163,15.424c12.715,0,25.472-4.608,35.605-13.931 c14.187-13.077,33.92-31.68,56.064-52.715c2.624,13.781,9.237,26.944,19.883,37.589c13.653,13.632,31.829,21.163,51.243,21.163 c19.392,0,37.568-7.531,51.221-21.163l84.352-84.352c28.245-28.245,28.245-74.197,0-102.464 c-9.109-9.109-20.587-14.891-32.747-17.92c20.693-20.011,34.197-33.109,34.795-33.685c11.2-11.328,27.285-16.853,52.395-16.469 h64.043c11.051,0.427,22.101-6.72,26.624-17.451C500.144,177.656,498.629,166.755,492.293,158.605z M320.816,303.011 c11.605,11.627,11.605,30.528,0,42.133l-84.352,84.352c-11.179,11.157-30.955,11.157-42.133,0 c-11.605-11.627-11.605-30.528,0-42.133l84.352-84.352c5.589-5.568,13.077-8.661,21.077-8.661 C307.738,294.349,315.226,297.443,320.816,303.011z"/>
                    </g>
                </g>
            </svg>
        </span>`.trim();
}

export function downloadBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="stroke: ${color}; fill: none;"                
            >
                <path d="M13.5 3H12H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H7.5M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V9.75V12V19C19 20.1046 18.1046 21 17 21H16.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 12V20M12 20L9.5 17.5M12 20L14.5 17.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>`.trim();
}

export function uploadBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="stroke: ${color}; fill: none;"                
            >
                <path d="M13.5 3H12H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H7.5M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V9.75V12V19C19 20.1046 18.1046 21 17 21H16.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 21L12 13M12 13L14.5 15.5M12 13L9.5 15.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>`.trim();
}

export function saveBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style="stroke: ${color}; fill: ${color};"                
            >
                <path  fill="none" d="M0 0h24v24H0z"/>
                <path d="M4 3h13l3.707 3.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 5v4h10V5H5z"/>
            </svg>
        </span>`.trim();
}

export function backBtn(data: string, color= 'black', size = 20) {
    data = (data || '').trim();
    color = (color || '').trim() || 'black';

    return `
        <span style="${svgIconBtnStl}" ${data}>
            <svg 
                width="${size}px" height="${size}px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                style="stroke: none; fill: ${color};"                
            >
                <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"/>
            </svg>
        </span>`.trim();
}

// gray lightgray
// blue lightblue
// green lightgreen
// orange
