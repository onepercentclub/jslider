interface NotificationManager
{
    on(eventName: any, callback?: Function, context?: any): any;
    off(eventName?: string, callback?: Function, context?: any): any;
    trigger(eventName: string, ...args: any[]): any;
    bind(eventName: string, callback: Function, context?: any): any;
    unbind(eventName?: string, callback?: Function, context?: any): any;
}