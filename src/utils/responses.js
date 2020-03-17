class Responses {
    static normal = (res, message, payload, status=200) => {
      return res.status(status).send({
        message,
        payload,
      });
    }
}

export default Responses;
