import jwtDecode from 'jwt-decode';
class Utils {
  static decodeJWT(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.log('Err', error);
      return null;
    }
  }

  static generateRandomString(length = 6) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  static generateRandomNumber(length) {
    return Math.floor(Math.random() * length);
  }
}

export default Utils;
