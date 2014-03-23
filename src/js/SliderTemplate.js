var SliderTemplate = (function () {
    function SliderTemplate(template) {
        this.cache = this.createTemplateFn(template);
    }
    SliderTemplate.prototype.render = function (data) {
        return this.cache(data);
    };

    SliderTemplate.prototype.createTemplateFn = function (template) {
        return new Function("data", "var p=[]," + "print=function(){" + "p.push.apply(p,arguments);" + "};" + "with(data){p.push('" + template.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
    };
    return SliderTemplate;
})();
