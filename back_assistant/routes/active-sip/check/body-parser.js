class BodyParser {
    getParameters(body) {
      const parameters = {
        sip: body.sip || null,
      };
  
      return parameters;
    }
  }
  
  module.exports = new BodyParser();
  