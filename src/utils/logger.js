class Logger {
  static log(type, data) {
    console[type](data);
  }
}

export default Logger;
