class Logger {
  static log(type, data) {
    console[type](data);
  }
  static normal(msg, data) {
    console.log(msg, data);
  }
}

export default Logger;
