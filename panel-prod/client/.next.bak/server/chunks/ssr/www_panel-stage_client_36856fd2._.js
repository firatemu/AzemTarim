module.exports=[299929,a=>{"use strict";var b=a.i(923963),c=a.i(819755);let d=(0,b.default)((0,c.jsx)("path",{d:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"}),"Visibility");a.s(["default",0,d])},729328,a=>{"use strict";var b=a.i(923963),c=a.i(819755);let d=(0,b.default)((0,c.jsx)("path",{d:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"}),"Add");a.s(["default",0,d])},191716,a=>{"use strict";var b=a.i(923963),c=a.i(819755);let d=(0,b.default)((0,c.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit");a.s(["default",0,d])},617239,a=>{"use strict";var b=a.i(923963),c=a.i(819755);let d=(0,b.default)((0,c.jsx)("path",{d:"M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5m0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3"}),"ToggleOn");a.s(["default",0,d])},910584,a=>{"use strict";var b=a.i(923963),c=a.i(819755);let d=(0,b.default)((0,c.jsx)("path",{d:"M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5M7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3"}),"ToggleOff");a.s(["default",0,d])},158562,a=>{"use strict";var b=a.i(285074),c=a.i(558750),d=a.i(996534),e=a.i(674803),f=a.i(325913),g=a.i(342806),h=a.i(428978),i=a.i(981497),j=a.i(574573);function k(a){return(0,j.default)("MuiSkeleton",a)}(0,i.default)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var l=a.i(819755);let m=e.keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,n=e.keyframes`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,o="string"!=typeof m?e.css`
        animation: ${m} 2s ease-in-out 0.5s infinite;
      `:null,p="string"!=typeof n?e.css`
        &::after {
          animation: ${n} 2s linear 0.5s infinite;
        }
      `:null,q=(0,f.styled)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(a,b)=>{let{ownerState:c}=a;return[b.root,b[c.variant],!1!==c.animation&&b[c.animation],c.hasChildren&&b.withChildren,c.hasChildren&&!c.width&&b.fitContent,c.hasChildren&&!c.height&&b.heightAuto]}})((0,g.default)(({theme:a})=>{let b=String(a.shape.borderRadius).match(/[\d.\-+]*\s*(.*)/)[1]||"px",c=parseFloat(a.shape.borderRadius);return{display:"block",backgroundColor:a.vars?a.vars.palette.Skeleton.bg:a.alpha(a.palette.text.primary,"light"===a.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${c}${b}/${Math.round(c/.6*10)/10}${b}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(a.vars||a).shape.borderRadius}},{props:({ownerState:a})=>a.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:a})=>a.hasChildren&&!a.width,style:{maxWidth:"fit-content"}},{props:({ownerState:a})=>a.hasChildren&&!a.height,style:{height:"auto"}},{props:{animation:"pulse"},style:o||{animation:`${m} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(a.vars||a).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:p||{"&::after":{animation:`${n} 2s linear 0.5s infinite`}}}]}})),r=b.forwardRef(function(a,b){let e=(0,h.useDefaultProps)({props:a,name:"MuiSkeleton"}),{animation:f="pulse",className:g,component:i="span",height:j,style:m,variant:n="text",width:o,...p}=e,r={...e,animation:f,component:i,variant:n,hasChildren:!!p.children},s=(a=>{let{classes:b,variant:c,animation:e,hasChildren:f,width:g,height:h}=a;return(0,d.default)({root:["root",c,e,f&&"withChildren",f&&!g&&"fitContent",f&&!h&&"heightAuto"]},k,b)})(r);return(0,l.jsx)(q,{as:i,ref:b,className:(0,c.default)(s.root,g),ownerState:r,...p,style:{width:o,height:j,...m}})});a.s(["default",0,r],158562)},104706,a=>{"use strict";var b=a.i(285074);function c(a,d=500){let[e,f]=(0,b.useState)(a);return(0,b.useEffect)(()=>{let b=setTimeout(()=>{f(a)},d);return()=>{clearTimeout(b)}},[a,d]),e}a.s(["useDebounce",()=>c])},731056,a=>{"use strict";var b=a.i(470628),c=a.i(158562),d=a.i(46664),e=a.i(937782);function f({rows:a=5,columns:f=6}){return(0,b.jsx)(b.Fragment,{children:Array.from({length:a}).map((a,g)=>(0,b.jsx)(e.default,{children:Array.from({length:f}).map((a,e)=>(0,b.jsx)(d.default,{children:(0,b.jsx)(c.default,{animation:"wave"})},e))},g))})}a.i(707505),a.s(["default",()=>f])}];

//# sourceMappingURL=www_panel-stage_client_36856fd2._.js.map