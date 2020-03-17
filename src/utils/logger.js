class Logger {
  static log(type, data) {
    // eslint-disable-next-line no-undef
    console[type](data);
  }
}

export default Logger;
