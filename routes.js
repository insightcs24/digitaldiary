const dbClass = require("./dbClass");
const opts = {
  errorEventName: "error",
  logDirectory: "./logs", // NOTE: folder must exist and be writable...
  fileNamePattern: "roll-<DATE>.log",
  dateFormat: "YYYY.MM.DD",
};
const log = require("simple-node-logger").createRollingFileLogger(opts);
log.setLevel("info");

module.exports = function (app) {
  app.get("/GetOTP", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getOTP({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetParentsLoginTokenBase64", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getParentsLoginTokenBase64({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetCompany", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getCompany({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json({
        Success: rows.length > 0 ? "1" : "0",
        Message:
          rows.length > 0 ? "COMPANY FOUND SUCCESSFULLY" : "COMPANY NOT FOUND",
        Company: rows,
      });
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetCompanyImages", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getCompanyImages({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetAttendance", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getAttendance({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetMonthlyAttendances", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getMonthlyAttendance({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetDailyAttendance", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getDailyAttendance({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetTest", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getTest({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetMonthlyTests", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getMonthlyTest({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetTimetable", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getTimetable({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetFees", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getFees({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetLeave", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getLeave({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.post("/SetLeave", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.setLeave({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next(error);
    }
  });

  app.get("/GetPublicNotice", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getPublicNotice({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetNotice", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getNotice({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetNoticeMobilebased", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getNoticeMobilebased({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.post("/SetNotice", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.setNotice({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next(error);
    }
  });
  app.get("/GetChat", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getChat({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.post("/SetChat", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.setChat({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next(error);
    }
  });

  app.post("/SetLastVisit", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.setLastVisit({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next(error);
    }
  });

  app.get("/GetPhotoGallery", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getPhotoGallery({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetVideoGallery", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getVideoGallery({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetPDFGallery", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getPDFGallery({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/GetExam", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.getExam({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/SubjectList", async function (req, res, next) {
    try {
      const { params, body, headers, query } = req;
      let rows = await dbClass.subjectList({
        params: params,
        body: body,
        headers: headers,
        query: query,
      });
      res.json(rows);
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });

  app.get("/callback", async function (req, res, next) {
    try {
      return next();
    } catch (error) {
      res.json({
        success: "101",
        Message: "ERROR IN DATA",
        InternalMessage: error.message,
      });
      log.info(error);
      return next();
    }
  });
};
