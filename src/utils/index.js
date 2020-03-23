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
}

export default Utils;
