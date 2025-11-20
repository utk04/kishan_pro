export const saveData=(k,d)=>localStorage.setItem(k,JSON.stringify(d));
export const getData=(k)=>JSON.parse(localStorage.getItem(k))||[];