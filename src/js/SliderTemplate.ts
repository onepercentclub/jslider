/**
 * Created by davidatborresen on 18.03.14.
 * Based on John Resigs Simple JavaScript Templating
 */
class SliderTemplate
{
    private cache:Function;


    /**
     * @param template
     */
    constructor(template:string)
    {
        this.cache = this.createTemplateFn(template);
    }

    /**
     * @param data
     * @returns {string}
     */
    public render(data:Object):string
    {
        return this.cache(data);
    }

    /**
     * @param template
     * @returns {Function}
     */
    private createTemplateFn(template):Function
    {
        return new Function("data",
            "var p=[]," +
            "print=function(){" +
                "p.push.apply(p,arguments);" +
             "};" +

            // Introduce the data as local variables using with(){}
            "with(data){p.push('" +
                // Convert the template into pure JavaScript
                template
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
            + "');}return p.join('');");
    }
}