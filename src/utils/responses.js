import Logger from './logger';

class Responses {
  static normal(res, data, message= 'ok', status=200) {
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

  static unknown(res, err, message='Internal Server Error Occured', status=500) {
    Logger.log('log', err);
    return res.status(status).send(
        this.response(message, null)
    );
  }
}

export default Responses;
