class Responses {
  static normal = (res, payload, status=200, message= 'ok') => {
    return res.status(status).send({
      message,
      payload,
    });
  }

  static unknown = () => {
    return res.status(status).send({
      message: 'Internal Server Error Occured',
      payload: null,
    });
  }
}

export default Responses;
