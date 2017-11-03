// this thing is just brought from
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement#Dynamically_importing_scripts

var importScript = (function (oHead) {

    return function (sSrc, fOnload, fOnerror) {
        var oScript = document.createElement("script");
        oScript.type = "text\/javascript";
        oScript.onerror = fOnerror;
        if (fOnload) { oScript.onload = fOnload; }
        oHead.appendChild(oScript);
        oScript.src = sSrc;
    }

})(document.head || document.getElementsByTagName("head")[0]);

module.exports = importScript;
