
const LibCookie = {

  setCookie(key: string, value: string) {
    try{
      const maxAge = 3600 * 24;
      document.cookie = `${key}=${value}; path=/; max-age=${maxAge}`; 
    }catch(e){ console.log(e); }
  },
  
  getCookie(name: string) {
    try{
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();      
    }catch(e){ console.log(e); }
  },

  deleteCookie(key: string) {
    try{
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`; 
    }catch(e){ console.log(e); }
  },

}
export default LibCookie;
