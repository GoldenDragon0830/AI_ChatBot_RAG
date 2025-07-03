export function generateRandomId () {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let autoId = "";
    for (let i = 0;i < 20; i ++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
}

export function generateUUID () {
    const temp = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return temp.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16); 
    })
}