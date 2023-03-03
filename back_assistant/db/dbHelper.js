const db = require("./dbConnection");

const dbHelper = {
  insertString: function (req, res) {
    try {
      const email = req.body.email;
      const action = req.body.action;
      const isActive = Number(req.body.isActive) === 1 ? true : false;
      const ls = req.body.ls;
      const product = Number(req.body.product);

      if (!(typeof email === "string" && typeof action === "string" && typeof isActive === "boolean" && typeof ls === "string" && !isNaN(product))) {
        const errorObject = {
          status: "parametersTypeError",
          types: { email: typeof email, action: typeof action, isActive: typeof isActive, ls: typeof ls, product: typeof product },
        };
        return res.json(errorObject);
      }

      db["db"]
        .one("INSERT INTO public.ma_statistic(email, action, isactive, ls, product) VALUES($1, $2, $3, $4, $5) RETURNING id", [email, action, isActive, ls, product])
        .then((data) => {
          const dataObject = { status: "done", data: data };
          return res.json(dataObject);
        })
        .catch((error) => {
          const errorObject = { status: "requestError", error: error };
          return res.json(errorObject);
        });
    } catch (err) {
      const errorObject = { status: "error", error: err };
      return res.json(errorObject);
    }
  },

  insertStringBpm: function (req, res) {
    try {
      const email = req.body.email;
      const type = req.body.type;
      const from = req.body.from;
      const to = req.body.to;
      const note = req.body.note || "stub";

      if (!(typeof email === "string" && /^[\w.]+@mangotele\.com$/i.test(email) && typeof type === "string" && typeof from === "string" && typeof to === "string")) {
        const errorObject = {
          status: "parametersTypeError",
          types: { email: typeof email, type: typeof type, from: typeof from, to: typeof to },
        };
        return res.json(errorObject);
      }

      db["db"]
        .one(`INSERT INTO public.ma_stats_bpm(email, type, "from", "to", "note") VALUES($1, $2, $3, $4, $5) RETURNING id`, [email, type, from, to, note])
        .then((data) => {
          const dataObject = { status: "done", data: data };
          return res.json(dataObject);
        })
        .catch((error) => {
          const errorObject = { status: "requestError", error: error };
          return res.json(errorObject);
        });
    } catch (err) {
      const errorObject = { status: "error", error: err };
      return res.json(errorObject);
    }
  },

  insertStringBpmOtp: function (req, res) {
    try {
      const email = req.body.email || "stub";
      const type = req.body.type;
      const from = req.body.from;
      const to = req.body.to;
      const note = req.body.note || " ";

      if (!(typeof type === "string" && typeof from === "string" && typeof to === "string")) {
        const errorObject = {
          status: "parametersTypeError",
          types: { type: typeof type, from: typeof from, to: typeof to },
        };
        return res.json(errorObject);
      }

      db["db"]
        .one(`INSERT INTO public.ma_stats_bpm_otp(type, "from", "to", "email", "note") VALUES($1, $2, $3, $4, $5) RETURNING id`, [type, from, to, email, note])
        .then((data) => {
          const dataObject = { status: "done", data: data };
          return res.json(dataObject);
        })
        .catch((error) => {
          const errorObject = { status: "requestError", error: error };
          return res.json(errorObject);
        });
    } catch (err) {
      const errorObject = { status: "error", error: err };
      return res.json(errorObject);
    }
  },
};

module.exports = {
  dbHelper,
};
