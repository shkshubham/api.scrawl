class Responses {
  static normal(res, data, status=200, message= true) {
    return res.status(status).send(this.response(message, data));
  }

  static error() {
    return res.status(status).send(this.response());
  }

  static response = (message, data) => {
    return {
      message,
      data,
    };
  }

  static unknown() {
    return res.status(status).send(
        this.response('Internal Server Error Occured', null));
  }
}

export default Responses;
