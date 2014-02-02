interface FB
{
    getLoginStatus(callback: (response:Object) => void):void;
    login(callback: (response:Object) => void):void;
    logout(callback: (response:Object) => void):void;
    init(params:Object):void;
}