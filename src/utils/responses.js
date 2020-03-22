class Responses {
  static normal(res, data, status=200, message= 'ok') {
    return res.status(status).send(this.response(message, data));
  }

  static error(res, message, data = null, status=400) {
    return res.status(status).send(this.response(message, data));
  }

  static response(message, data) {
    return {
      message,
      data,
    };
  }

  static unknown(res, message='Internal Server Error Occured', status=500) {
    return res.status(status).send(
        this.response(message, null)
    );
  }
}

export default Responses;
