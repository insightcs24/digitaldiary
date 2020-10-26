//const mysql = require("mysql");
const mysql = require("mysql2/promise");
const util = require("util");
const helper = require("./helper");
const fs = require("fs");
const moment = require("moment");
const https = require("https");
const readFile = util.promisify(fs.readFile);
const statFile = util.promisify(fs.stat);
const existFile = util.promisify(fs.exists);
const fetch = require("node-fetch");
const basePath = ".//public//img//";
const http = require("http");

// const pool = mysql.createPool({
//   host: "alphaerp.in",
//   user: "digitald2",
//   password: "Alpha654!",
//   database: "yogesh_digitaldiary",
//   charset: "utf8",
//   connectionLimit: 10,
//   connectTimeout: 10000
// });

const pool = mysql.createPool({
  host: "dbialphacrm.cixxkjoxvink.ap-south-1.rds.amazonaws.com",
  user: "alphacrm",
  port: 3342,
  password: "Dhairya951!",
  database: "digitaldiary",
  charset: "utf8",
  connectionLimit: 10,
  connectTimeout: 10000,
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      log.info("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      log.info("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      log.info("Database connection was refused.");
    }
  }
  if (connection) connection.release();
  return;
});

pool.query = util.promisify(pool.query);

async function imageToByte(imgpaths, type) {
  if (imgpaths.toString().trim() === "") return null;

  let filePath;

  if (type.trim() === "header") filePath = basePath + "appheader//" + imgpaths;
  else if (type.trim() === "logo") filePath = basePath + "cmplogo//" + imgpaths;
  else if (type.trim() == "member")
    filePath = basePath + "memphoto//" + imgpaths;

  if (await existFile(filePath)) {
    return await readFile(filePath, "base64");
  } else {
    if (type.trim() === "header")
      filePath = basePath + "appheader//IMG_20180601.jpg";
    else if (type.trim() === "logo")
      filePath = basePath + "cmplogo//IMG_20180601.jpg";
    else if (type.trim() === "member")
      filePath = basePath + "memphoto//IMG_20180601.jpg";

    if (filePath === null || filePath === undefined || filePath.trim() === "")
      return null;
    else return await readFile(filePath, "base64");
  }
}

async function SMSSend(mobile, message) {
  let smsapi =
    "http://sms.alphacomputers.biz/api/v3/index.php?method=sms&api_key=A4840f10ce73edb50b9e8e4c966524d2d&to=" +
    mobile +
    "&sender=DIGITL&message=" +
    message +
    "&format=XML&flash=0";
  const httpagent = new http.Agent({
    keepAlive: false,
    agent: "Mozilla/3.0 (compatible; My Browser/1.0)",
  });
  const response = await fetch(smsapi, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    agent: httpagent,
    timeout: 600,
  });
  // try {

  // } catch (error) {
  //   console.log(error);
  // }
}

module.exports = {
  getOTP: async function (request) {
    let _sOTP = "";
    let user = undefined;
    let mobile = undefined;
    if (request.headers.mobile)
      mobile = request.headers.mobile.toString().trim();
    else throw new Error("Parameter Incorrent !!!");
    let mobileArray = [
      "9408631600",
      "9408631200",
      "9408620120",
      "9409933335",
      "9409933336",
      "9409933337",
      "9409933338",
      "9723655108",
      "9328064380",
      "9029944862",
    ];
    let connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      if (mobileArray.includes(mobile)) {
        _sOTP = mobile.substring(6, 10);
        let updateString =
          "Update member set Mobile1_Pass=N'" +
          _sOTP +
          "' Where Mobile1=N'" +
          mobile +
          "'";

        await connection.query(updateString);

        updateString =
          "Update member set Mobile2_Pass=N'" +
          _sOTP +
          "' Where Mobile2=N'" +
          mobile +
          "'";

        await connection.query(updateString);

        updateString =
          "Update member set Mobile3_Pass=N'" +
          _sOTP +
          "' Where Mobile3=N'" +
          mobile +
          "'";

        await connection.query(updateString);

        user = {
          Success: "1",
          Message: "USER FOUND SUCCESSFULLY",
          Mobile: mobile,
          Password: _sOTP,
        };
      } else {
        let queryString =
          "Select m.Mem_ID,m.Mobile1,m.Mobile2,m.Mobile3,m.Mobile1_Pass,m.Mobile2_Pass,m.Mobile3_Pass,m.Status,c.ExpiryDate,c.Cmp_ID" +
          " from member m inner join company c on c.cmp_id = m.Cmp_ID Where (m.Mobile1=N'" +
          mobile +
          "' OR m.Mobile2=N'" +
          mobile +
          "' OR m.Mobile3=N'" +
          mobile +
          "') and m.Status='1' and c.ExpiryDate >= CURDATE()";
        let result = await pool.query(queryString);

        if (result.length > 0) {
          _sOTP = Math.round(helper.randomGenerator(1000, 9999)).toString();
          let updateString =
            "Update member set Mobile1_Pass=N'" +
            _sOTP +
            "' Where Mobile1=N'" +
            mobile +
            "'";
          await connection.query(updateString);

          updateString =
            "Update member set Mobile2_Pass=N'" +
            _sOTP +
            "' Where Mobile2=N'" +
            mobile +
            "'";

          await connection.query(updateString);

          updateString =
            "Update member set Mobile3_Pass=N'" +
            _sOTP +
            "' Where Mobile3=N'" +
            mobile +
            "'";

          await connection.query(updateString);

          if (result.length > 0) {
            SMSSend(mobile, "Your OTP \n" + _sOTP);
            user = {
              Success: "1",
              Message: "USER FOUND SUCCESSFULLY",
              Mobile: mobile,
              Password: _sOTP,
            };
          } else {
            user = {
              Success: "0",
              Message: "USER NOT FOUND",
              Mobile: mobile,
              Password: "",
            };
          }
        }
      }
      await connection.commit();
      if (connection) connection.release();
    } catch (error) {
      await connection.rollback();
      if (connection) connection.release();
      throw error;
    }

    if (!user) {
      return {
        Success: "0",
        Message: "USER NOT FOUND",
        Mobile: "",
        Password: "",
      };
    } else return user;
  },

  getParentsLoginTokenBase64: async function (request) {
    let allProperties = ["CmpID", "Mobile", "Password", "TokenID"];
    let userlogin = undefined;
    if (request.headers.userlogin) {
      try {
        userlogin = JSON.parse(request.headers.userlogin);
        for (let cnt = 0; cnt < allProperties.length; cnt++) {
          let element = allProperties[cnt];
          if (!userlogin.hasOwnProperty(element))
            return {
              Success: "0",
              Message: "Input parameter userlogin is not User Login Object !!!",
            };
          if (typeof userlogin[element] !== "string")
            return {
              Success: "0",
              Message:
                "Input parameter " +
                element +
                " property is not string type !!!",
            };
        }
      } catch (error) {
        return {
          Success: "0",
          Message: "Input parameter userlogin is not JSON string !!!",
        };
      }
    } else {
      return {
        Success: "0",
        Message: "Input JSON parameter userlogin not defined !!!",
      };
    }

    let queryString = undefined;

    if (parseInt(userlogin.CmpID) === 0)
      queryString =
        "Select m.Mem_ID,m.Cmp_ID,c.Name as Cmp_Name,c.Cmp_key,c.DisplayType,c.DealerType,c.PDF_Gallery,DATE_FORMAT(m.AdmissionDate,'%Y-%m-%d') AS AdmissionDate," +
        "c.logo,m.GRNo,m.RollNo,m.Name,m.Gender,m.Std,m.Division,m.DOB,m.Address,m.Mobile1,m.Mobile2," +
        "m.Mobile3,m.Email,m.Status,m.Photo from member m LEFT JOIN company c on c.Cmp_ID = m.cmp_id" +
        " Where (m.Mobile1=N'" +
        userlogin.Mobile +
        "' OR m.Mobile2=N'" +
        userlogin.Mobile +
        "' OR m.Mobile3=N'" +
        userlogin.Mobile +
        "') and (m.Status='1' and c.Status='1') and (m.Mobile1_Pass=N'" +
        userlogin.Password +
        "' OR m.Mobile2_Pass=N'" +
        userlogin.Password +
        "' OR m.Mobile3_Pass=N'" +
        userlogin.Password +
        "') and c.ExpiryDate >= CURDATE()";
    else
      queryString =
        "Select m.Mem_ID,m.Cmp_ID,c.Name as Cmp_Name,c.Cmp_key,c.DisplayType,c.DealerType,c.PDF_Gallery,DATE_FORMAT(m.AdmissionDate,'%Y-%m-%d') AS AdmissionDate," +
        "c.logo,m.GRNo,m.RollNo,m.Name,m.Gender,m.Std,m.Division,m.DOB,m.Address,m.Mobile1,m.Mobile2," +
        "m.Mobile3,m.Email,m.Status,m.Photo from member m LEFT JOIN company c on c.Cmp_ID = m.cmp_id" +
        " Where (m.Mobile1=N'" +
        userlogin.Mobile +
        "' OR m.Mobile2=N'" +
        userlogin.Mobile +
        "' OR m.Mobile3=N'" +
        userlogin.Mobile +
        "') and (m.Status='1' and c.Status='1') and (m.Mobile1_Pass=N'" +
        userlogin.Password +
        "' OR m.Mobile2_Pass=N'" +
        userlogin.Password +
        "' OR m.Mobile3_Pass=N'" +
        userlogin.Password +
        "') and c.ExpiryDate >= CURDATE() and m.Cmp_ID = '" +
        userlogin.CmpID +
        "'";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      let updateString =
        "Update member set TokenID1=N'" +
        userlogin.TokenID +
        "' Where Mobile1 = N'" +
        userlogin.Mobile +
        "'";
      await pool.query(updateString);

      updateString =
        "Update member set TokenID2=N'" +
        userlogin.TokenID +
        "' Where Mobile2 = N'" +
        userlogin.Mobile +
        "'";
      await pool.query(updateString);

      updateString =
        "Update member set TokenID3=N'" +
        userlogin.TokenID +
        "' Where Mobile3 = N'" +
        userlogin.Mobile +
        "'";
      await pool.query(updateString);

      let member = [];
      await helper.asyncForEach(result, async (row) => {
        let dob = moment(row["DOB"]);
        let logo = await readFile(basePath + "cmplogo//logo.jpg", "base64");
        if (!dob.isValid()) dob = moment("01-01-1900");
        else dob = dob.format("DD-MM-YYYY");

        try {
          if (await existFile(basePath + "cmplogo//" + row["logo"]))
            logo = await readFile(
              basePath + "cmplogo//" + row["logo"],
              "base64"
            );
        } catch (error) {}

        member.push({
          Mem_ID: row["Mem_ID"],
          Cmp_Key: row["Cmp_key"],
          Cmp_Name: row["Cmp_Name"],
          Logo: logo,
          AdmissionDate: row["AdmissionDate"],
          GRNo: row["GRNo"],
          RollNo: row["RollNo"],
          Name: row["Name"],
          Gender: row["Gender"],
          Std: row["Std"],
          Division: row["Division"],
          DOB: dob,
          Address: row["Address"],
          Mobile1: row["Mobile1"],
          Mobile2: row["Mobile2"],
          Mobile3: row["Mobile3"],
          Email: row["Email"],
          Status: row["Status"],
          Photo: await imageToByte(
            row["Cmp_ID"] +
              "\\" +
              (row["Photo"] === null || row["Photo"].trim() === ""
                ? "IMG_20180601.jpg"
                : row["Photo"]),
            "member"
          ),
          DisplayType: row["DisplayType"],
          DealerType: row["DealerType"],
        });
      });

      return {
        Success: result.length > 0 ? "1" : "0",
        Message:
          result.length > 0 ? "MEMBER FOUND SUCCESSFULLY" : "MEMBER NOT FOUND",
        MemberList: member,
      };
    }
  },

  getCompany: async function (request) {
    if (!request.headers.cmpkey) throw new Error("Parameter Incorrect !!!");
    let queryString =
      "Select Cmp_ID, Type, Name, DealerType, DealerName, Address," +
      "City, Distict, State, Country, Pincode, Owner, Mobile, Email, Website, Logo," +
      "Remarks, Status, Cmp_Key, PageHeader, Password, GPSLocation,DisplayType," +
      "PageHeader1,PageHeader2,Facebook,Youtube,Instagram,Twitter,Google," +
      "Twitter,Google,WhatsApp,Class_Attendance,Auto_Attendance,Timetable," +
      "Test,Homework,Classwork,Notice,News,Exam,Fees,`Leave`,Chat,Video_Gallery," +
      "Photo_Gallery,PDF_Gallery,Lecture_Attendance From company" +
      " Where Cmp_Key = N'" +
      request.headers.cmpkey +
      "' and `Status` = '1' and" +
      " ExpiryDate >= CURDATE()";

    let result = await pool.query(queryString);

    return result;
  },

  getCompanyImages: async function (request) {
    let logo, pageHeader, pageHeader1, pageHeader2;

    if (!request.headers.logo || !request.headers.pageheader)
      throw new Error("Parameters Incorrect!!!");

    if (await existFile(basePath + "cmplogo//" + request.headers.logo))
      logo = await readFile(
        basePath + "cmplogo//" + request.headers.logo,
        "base64"
      );
    else
      logo = await readFile(basePath + "cmplogo//IMG_20180601.jpg", "base64");

    if (await existFile(basePath + "appheader//" + request.headers.pageheader))
      pageHeader = await readFile(
        basePath + "appheader//" + request.headers.pageheader,
        "base64"
      );
    else
      pageHeader = await readFile(
        basePath + "appheader//IMG_20180601.jpg",
        "base64"
      );

    // if (await existFile(basePath + "appheader//" + request.headers.pageHeader1))
    //   pageHeader1 = await readFile(request.headers.pageHeader1, "base64");
    // else
    //   pageHeader1 = await readFile(request.headers.pageHeader1, "base64");

    // if (request.headers.pageHeader2)
    //   pageHeader2 = await readFile(request.headers.pageHeader2, "base64");

    return {
      logo: logo,
      pageHeader: pageHeader,
      // pageHeader1: pageHeader1,
      // pageHeader2: pageHeader2
    };
  },

  getAttendance: async function (request) {
    if (!request.headers.memid) throw new Error("Parameters Incorrect!!!");
    let queryString =
      "Select DATE_FORMAT(a.Att_Date,'%Y-%m-%d') AS Att_Date,a.Std,a.Division,a.Lacture,a.Faculty,a.Subject,ad.Status," +
      " (Select Count(ads.Att_DID) From attendance_details ads inner join attendance a on a.Att_ID =ads.Att_ID" +
      " where ads.mem_id=" +
      request.headers.memid +
      ") as AttendanceDay, (Select Count(ads.Att_DID)" +
      " From attendance_details ads inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='L'" +
      " AND  ads.mem_id=" +
      request.headers.memid +
      ") as `Leave`,  (Select Count(ads.Att_DID) From" +
      " attendance_details ads inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='A' AND" +
      " ads.mem_id=" +
      request.headers.memid +
      ") as Absent,  (Select Count(ads.Att_DID) From" +
      " attendance_details ads inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='P' " +
      " AND  ads.mem_id=" +
      request.headers.memid +
      ") as Present, (Select Count(ads.Att_DID) From " +
      " attendance_details ads inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='H' " +
      " AND  ads.mem_id=" +
      request.headers.memid +
      ") as Holliday From attendance_details as ad  " +
      " inner join attendance as a on a.att_id = ad.att_id where ad.mem_id=" +
      request.headers.memid;

    let result = await pool.query(queryString);

    let attMain = [];
    await helper.asyncForEach(result, async (row) => {
      attMain.push({
        Date: row["Att_Date"],
        Faculty: row["Faculty"],
        Lacture: row["Lacture"],
        Status: row["Status"],
        Subject: row["Subject"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "ATTENDANCE FOUND SUCCESSFULLY"
          : "ATTENDANCE NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      PresentDay:
        result.length > 0 ? result[0].Present.toString().trim() : null,
      AbsentDay: result.length > 0 ? result[0].Absent.toString().trim() : null,
      LeaveDay: result.length > 0 ? result[0].Leave.toString().trim() : null,
      AttendanceDay:
        result.length > 0 ? result[0].AttendanceDay.toString().trim() : null,
      HolliDay: result.length > 0 ? result[0].Holliday.toString().trim() : null,
      StudAttendance: attMain,
    };
  },

  getMonthlyAttendance: async function (request) {
    if (!request.headers.date)
      return {
        Success: "0",
        Message: "Date not define!!!",
      };

    let date = moment(request.headers.date);

    if (!date.isValid())
      return {
        Success: "0",
        Message: "Error in Date",
      };

    if (!request.headers.memid) throw new Error("Parameters Incorrect !!!");
    let queryString =
      "Select DATE_FORMAT(a.Att_Date,'%Y-%m-%d') AS Att_Date,a.Std,a.Division,a.Lacture,a.Faculty,a.Subject,ad.Status," +
      " (Select Count(ads.Att_DID) From attendance_details ads" +
      " inner join attendance a on a.Att_ID = ads.Att_ID where ads.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")) as AttendanceDay, (Select Count(ads.Att_DID) From attendance_details ads" +
      " inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='L' AND  ads.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")) as `Leave`,  (Select Count(ads.Att_DID) From attendance_details ads" +
      " inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='A' AND  ads.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")) as Absent,  (Select Count(ads.Att_DID) From attendance_details ads" +
      " inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='P' AND  ads.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")) as Present, (Select Count(ads.Att_DID) From attendance_details ads" +
      " inner join attendance a on a.Att_ID =ads.Att_ID where ads.Status='H' AND  ads.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")) as Holliday From attendance_details as ad" +
      " inner join attendance as a on a.att_id = ad.att_id where ad.mem_id=" +
      request.headers.memid +
      " and (YEAR(a.Att_Date) = " +
      date.format("YYYY") +
      " AND MONTH(a.Att_Date) = " +
      date.format("MM") +
      ")";

    let result = await pool.query(queryString);

    let attMain = [];
    await helper.asyncForEach(result, async (row) => {
      attMain.push({
        Date: row["Att_Date"],
        Faculty: row["Faculty"],
        Lacture: row["Lacture"],
        Status: row["Status"],
        Subject: row["Subject"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "ATTENDANCE FOUND SUCCESSFULLY"
          : "ATTENDANCE NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      PresentDay:
        result.length > 0 ? result[0].Present.toString().trim() : null,
      AbsentDay: result.length > 0 ? result[0].Absent.toString().trim() : null,
      LeaveDay: result.length > 0 ? result[0].Leave.toString().trim() : null,
      AttendanceDay:
        result.length > 0 ? result[0].AttendanceDay.toString().trim() : null,
      HolliDay: result.length > 0 ? result[0].Holliday.toString().trim() : null,
      StudAttendance: attMain,
    };
  },

  getDailyAttendance: async function (request) {
    if (!request.headers.date)
      return {
        Success: "0",
        Message: "Date not define!!!",
      };

    let date = moment(request.headers.date);

    if (!date.isValid())
      return {
        Success: "0",
        Message: "Error in Date",
      };

    if (!request.headers.memid) throw new Error("Parameters Incorrect !!!");
    let queryString =
      "Select a.Att_Date,a.Std,a.Division,a.Lacture,a.Faculty,a.Subject,ad.Status" +
      " From attendance_details as ad  inner join attendance as a on a.att_id = ad.att_id" +
      " where ad.mem_id=" +
      request.headers.memid +
      " and a.Att_Date = '" +
      date.format("YYYY-MM-DD") +
      "'";

    let result = await pool.query(queryString);

    let attMain = [];
    await helper.asyncForEach(result, async (row) => {
      attMain.push({
        Date: row["Att_Date"],
        Faculty: row["Faculty"],
        Lacture: row["Lacture"],
        Status: row["Status"],
        Subject: row["Subject"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "ATTENDANCE FOUND SUCCESSFULLY"
          : "ATTENDANCE NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      StudAttendance: attMain,
    };
  },

  getTest: async function (request) {
    if (!request.headers.memid) throw new Error("Parameters Incorrect!!!");
    let queryString =
      "Select DATE_FORMAT(t.Test_Date,'%Y-%m-%d') AS Test_Date,t.Round,t.Std,t.`Division`,t.`Faculty`," +
      "t.`Subject`,t.TotalMarks,t.PassMarks,td.Marks,td.`Status` from testdetails td" +
      " inner join test t on t.Test_ID = td.Test_ID where td.Mem_ID=" +
      request.headers.memid +
      " ORDER BY Test_Date DESC";

    let result = await pool.query(queryString);

    let testMain = [];
    await helper.asyncForEach(result, async (row) => {
      testMain.push({
        Date: row["Test_Date"],
        Faculty: row["Faculty"],
        Marks: row["Marks"],
        PassMarks: row["PassMarks"],
        TotalMarks: row["TotalMarks"],
        Round: row["Round"],
        Status: row["Status"],
        Subject: row["Subject"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "TEST FOUND SUCCESSFULLY" : "TEST NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      StudTest: testMain,
    };
  },

  getMonthlyTest: async function (request) {
    if (!request.headers.date)
      return {
        Success: "0",
        Message: "Date not define!!!",
      };

    let date = moment(request.headers.date);

    if (!date.isValid())
      return {
        Success: "0",
        Message: "Error in Date",
      };

    if (!request.headers.memid) throw new Error("Parameters Incorrect !!!");
    let queryString =
      "Select t.Test_Date,t.Round,t.Std,t.`Division`,t.`Faculty`,t.`Subject`,t.TotalMarks," +
      "t.PassMarks,td.Marks,td.`Status` from testdetails td inner join test t on t.Test_ID = td.Test_ID" +
      " where td.Mem_ID=" +
      request.headers.memid +
      "  and (YEAR(Test_Date) = " +
      date.format("YYYY") +
      " AND MONTH(Test_Date) = " +
      date.format("MM") +
      ") ORDER BY Test_Date DESC";

    let result = await pool.query(queryString);

    let testMain = [];
    await helper.asyncForEach(result, async (row) => {
      testMain.push({
        Date: row["Test_Date"],
        Faculty: row["Faculty"],
        Marks: row["Marks"],
        PassMarks: row["PassMarks"],
        TotalMarks: row["TotalMarks"],
        Round: row["Round"],
        Status: row["Status"],
        Subject: row["Subject"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "TEST FOUND SUCCESSFULLY" : "TEST NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      StudTest: testMain,
    };
  },

  getTimetable: async function (request) {
    if (
      !request.headers.std ||
      !request.headers.division ||
      !request.headers.cmpkey
    )
      throw new Error("Parameters Incorrect !!!");
    let queryString =
      "Select t.Time_ID,t.Cmp_ID,t.Std,t.Division,DATE_FORMAT(t.Date,'%Y-%m-%d') AS Date," +
      " t.Time,t.Subject,t.Faculty,t.Type,t.Remarks,t.MachineID," +
      " t.Admin_ID,t.ModifyDate from Timetable t " +
      " inner join Company c on c.Cmp_ID =t.Cmp_Id" +
      " Where t.Std =N'" +
      request.headers.std +
      "' and t.Division = N'" +
      request.headers.division +
      "' and c.Cmp_key=N'" +
      request.headers.cmpkey +
      "'";

    let result = await pool.query(queryString);

    let timetableMain = [];
    await helper.asyncForEach(result, async (row) => {
      timetableMain.push({
        Date: row["Date"],
        Faculty: row["Faculty"],
        Remarks: row["Remarks"],
        Subject: row["Subject"],
        Time: row["Time"],
        Type: row["Type"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "TIMETABLE FOUND SUCCESSFULLY"
          : "TIMETABLE NOT FOUND",
      Standard: result.length > 0 ? result[0].Std.toString().trim() : null,
      Division: result.length > 0 ? result[0].Division.toString().trim() : null,
      StudTimetable: timetableMain,
    };
  },

  getFees: async function (request) {
    let _Receipt = 0,
      _Charges = 0;

    if (!request.headers.memid) throw new Error("Parameters Incorrect !!!");
    let queryString =
      "Select Fees_ID,Cmp_ID,Mem_ID,Fees_Type,Fees_Amount,DATE_FORMAT(Fees_Date,'%Y-%m-%d') AS Fees_Date," +
      " PaymentMode,Remarks,Admin_ID,ModifyDate From fees Where Mem_Id=" +
      request.headers.memid +
      " Order By Fees_ID DESC";

    let result = await pool.query(queryString);

    let feesMain = [];
    await helper.asyncForEach(result, async (row) => {
      feesMain.push({
        Fees_Amount: row["Fees_Amount"],
        Fees_Date: row["Fees_Date"],
        Fees_Type: row["Fees_Type"][0],
        PaymentMode: row["PaymentMode"],
        Remarks: row["Remarks"],
      });
      if (row["Fees_Type"][0].toString().trim() === "0")
        _Charges += parseInt(row["Fees_Amount"]);
      else _Receipt += parseInt(row["Fees_Amount"]);
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "FEES DETAILS FOUND SUCCESSFULLY"
          : "FEES DEATILS NOT FOUND",
      Credit: _Charges.toString(),
      Debit: (_Charges - _Receipt).toString(),
      StudFee: feesMain,
    };
  },

  getLeave: async function (request) {
    if (!request.headers.memid) throw new Error("Parameters Incorrect !!!");

    let queryString =
      "Select Leave_ID,Cmp_ID,Mem_ID,DATE_FORMAT(LeaveFrom,'%Y-%m-%d') AS LeaveFrom," +
      " DATE_FORMAT(LeaveTo,'%Y-%m-%d') AS LeaveTo,LeaveReason,Remarks,Status,Admin_ID,ModifyDate" +
      " From `Leave` Where Mem_Id=" +
      request.headers.memid +
      " Order by Leave_ID DESC";

    let result = await pool.query(queryString);

    let leaveMain = [];
    await helper.asyncForEach(result, async (row) => {
      leaveMain.push({
        LeaveFrom: row["LeaveFrom"],
        LeaveReason: row["LeaveReason"],
        LeaveTo: row["LeaveTo"],
        Remarks: row["Remarks"],
        Status: row["Status"],
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0 ? "LEAVE FOUND SUCCESSFULLY" : "LEAVE NOT FOUND",
      StudLeave: leaveMain,
    };
  },

  setLeave: async function (request) {
    let connection;

    if (!request.headers.cmpkey) throw new Error("Parameters Incorrect !!!");

    let queryString =
      "Select Cmp_Id from Company Where cmp_key=N'" +
      request.headers.cmpkey +
      "'";
    let result = await pool.query(queryString);

    if (
      !request.headers.memid ||
      !request.headers.leavefrom ||
      !request.headers.leaveto ||
      !request.headers.leavereason ||
      !request.headers.remarks ||
      !request.headers.status
    )
      throw new Error("Parameters Incorrect !!!");

    if (result.length === 1) {
      let insertString =
        "insert into `leave` (`Cmp_ID`,`Mem_Id`,`LeaveFrom`,`LeaveTo`,`LeaveReason`,`Remarks`,`Status`) values(" +
        result[0].Cmp_Id +
        "," +
        request.headers.memid +
        ",'" +
        request.headers.leavefrom +
        "','" +
        request.headers.leaveto +
        "','" +
        request.headers.leavereason +
        "','" +
        request.headers.remarks +
        "'," +
        request.headers.status +
        ")";

      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        result = await connection.query(insertString);

        await connection.commit();
        if (connection) connection.release();
        if (result.length) result = result[0];
        if (result.affectedRows === 1)
          return {
            Success: "1",
            Message: "LEAVE ADD SUCCESSFULLY",
          };
        else
          return {
            Success: "0",
            Message: "LEAVE NOT ADD SUCCESSFULLY",
          };
      } catch (error) {
        await connection.rollback();
        if (connection) connection.release();
        throw error;
      }
    } else {
      return {
        Success: "0",
        Message: "COMPANY NOT FOUND",
      };
    }
  },

  getNotice: async function (request) {
    let noticeType = undefined,
      show = undefined;
    if (!request.headers.show) show = "0";
    else if (request.headers.show === "All") show = "0,1";
    else if (request.headers.show === "New") show = "0";
    else show = "0";

    if (!request.headers.noticetype) noticeType = "%";
    else if (request.headers.noticetype)
      noticeType = request.headers.noticetype;

    if (
      !request.headers.cmpkey ||
      !request.headers.memid ||
      !request.headers.mobile
    )
      throw new Error("Parameters Incorrect!!!");
    let queryString =
      "Select DATE_FORMAT(g.Notice_Date,'%Y-%m-%d %H:%i:%s') AS Notice_Date,g.Std,g.Division,g.Notice_Type," +
      "g.Notice_Msg,g.File1,g.File2,g.File3,g.File1Type,g.File2Type,g.File3Type,g.Replay_Type," +
      "g.Notice_Replay,g.Notification,gd.Mem_ID,gd.Mobile1_Status,gd.Mobile2_Status,gd.Mobile3_Status," +
      "gd.Mobile1_Status as ViewMessage,c.Cmp_ID From generalnoticedetails gd" +
      " inner join generalnotice g on g.Notice_ID = gd.Notice_ID inner join Member m on m.Mem_ID =" +
      " gd.Mem_ID inner join company c on c.Cmp_ID = m.Cmp_ID Where c.Cmp_Key=N'" +
      request.headers.cmpkey +
      "' and gd.Mem_ID=" +
      request.headers.memid +
      " and m.Mobile1=N'" +
      request.headers.mobile +
      "' and g.Notice_Type like '" +
      noticeType +
      "' and Mobile1_Status in (" +
      show +
      ") ORDER BY g.Notice_ID ASC";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      let updateString =
        "update generalnoticedetails set Mobile1_Status = 1 Where Mem_ID = '" +
        request.headers.memid +
        "' and Mobile1_Status = 0";
      await pool.query(updateString);
    } else if (result.length === 0) {
      queryString =
        "Select DATE_FORMAT(g.Notice_Date,'%Y-%m-%d %H:%i:%s') AS Notice_Date,g.Std,g.Division,g.Notice_Type," +
        "g.Notice_Msg,g.File1,g.File2,g.File3,g.File1Type,g.File2Type,g.File3Type,g.Replay_Type," +
        "g.Notice_Replay,g.Notification,gd.Mem_ID,gd.Mobile1_Status,gd.Mobile2_Status,gd.Mobile3_Status," +
        "gd.Mobile1_Status as ViewMessage,c.Cmp_ID From generalnoticedetails gd" +
        " inner join generalnotice g on g.Notice_ID = gd.Notice_ID inner join Member m on m.Mem_ID =" +
        " gd.Mem_ID inner join company c on c.Cmp_ID = m.Cmp_ID Where c.Cmp_Key=N'" +
        request.headers.cmpkey +
        "' and gd.Mem_ID=" +
        request.headers.memid +
        " and m.Mobile2=N'" +
        request.headers.mobile +
        "' and g.Notice_Type like '" +
        noticeType +
        "' and Mobile2_Status in (" +
        show +
        ") ORDER BY g.Notice_ID ASC";

      result = await pool.query(queryString);

      if (result.length > 0) {
        updateString =
          "update generalnoticedetails set Mobile2_Status = 1 Where Mem_ID = '" +
          request.headers.memid +
          "' and Mobile2_Status = 0";
        await pool.query(updateString);
      } else if (result.length === 0) {
        queryString =
          "Select DATE_FORMAT(g.Notice_Date,'%Y-%m-%d %H:%i:%s') AS Notice_Date,g.Std,g.Division,g.Notice_Type," +
          "g.Notice_Msg,g.File1,g.File2,g.File3,g.File1Type,g.File2Type,g.File3Type,g.Replay_Type," +
          "g.Notice_Replay,g.Notification,gd.Mem_ID,gd.Mobile1_Status,gd.Mobile2_Status,gd.Mobile3_Status," +
          "gd.Mobile1_Status as ViewMessage,c.Cmp_ID From generalnoticedetails gd" +
          " inner join generalnotice g on g.Notice_ID = gd.Notice_ID inner join Member m on m.Mem_ID =" +
          " gd.Mem_ID inner join company c on c.Cmp_ID = m.Cmp_ID Where c.Cmp_Key=N'" +
          request.headers.cmpkey +
          "' and gd.Mem_ID=" +
          request.headers.memid +
          " and m.Mobile3=N'" +
          request.headers.mobile +
          "' and g.Notice_Type like '" +
          noticeType +
          "' and Mobile3_Status in (" +
          show +
          ") ORDER BY g.Notice_ID ASC";

        result = await pool.query(queryString);

        if (result.length > 0) {
          updateString =
            "update generalnoticedetails set Mobile3_Status = 1 Where Mem_ID = '" +
            request.headers.memid +
            "' and Mobile3_Status = 0";
          await pool.query(updateString);
        }
      }
    }
    let path = "";

    if (result.length > 0)
      path = basePath + "notice//" + result[0].Cmp_ID.toString().trim() + "//";

    let noticeMain = [];
    await helper.asyncForEach(result, async (row) => {
      let _File1 = {},
        _File2 = {},
        _File3 = {};

      if (
        row.File1 !== null &&
        row.File1.toString().trim().length > 10 &&
        row.File1.toString().trim() !== "VDI"
      ) {
        let exist = undefined;
        if (row.File1.toString().trim() === "") exist = false;
        else exist = await existFile(path + row.File1.toString().trim());

        if (exist) _File1 = await statFile(path + row.File1.toString().trim());
        else _File1["size"] = "0";
      } else {
        _File1["size"] = "0";
      }
      if (
        row.File2 !== null &&
        row.File2.toString().trim().length > 10 &&
        row.File2.toString().trim() !== "VDI"
      ) {
        let exist = undefined;

        if (row.File2.toString().trim() === "") exist = false;
        else exist = await existFile(path + row.File2.toString().trim());

        if (exist) _File2 = await statFile(path + row.File2.toString().trim());
        else _File2["size"] = "0";
      } else _File2["size"] = "0";
      if (
        row.File3 !== null &&
        row.File3.toString().trim().length > 10 &&
        row.File3.toString().trim() !== "VDI"
      ) {
        let exist = undefined;
        if (row.File3.toString().trim() === "") exist = false;
        else exist = await existFile(path + row.File3.toString().trim());

        if (exist) _File3 = await statFile(path + row.File3.toString().trim());
        else _File3["size"] = "0";
      } else _File3["size"] = "0";

      noticeMain.push({
        Notice_Date: row.Notice_Date,
        Notice_Type: row.Notice_Type,
        Notice_Msg: row.Notice_Msg,
        File1: row.File1 === null ? "" : row.File1,
        File1Type: row.File1Type,
        File1Size: _File1 === null ? "0" : _File1["size"],

        File2: row.File2 === null ? "" : row.File2,
        File2Type: row.File2Type,
        File2Size: _File2 === null ? "0" : _File2["size"],

        File3: row.File3 === null ? "" : row.File3,
        File3Type: row.File3Type,
        File3Size: _File3 === null ? "0" : _File3["size"],
        Replay_Type: row.Replay_Type[0],
        Notice_Replay: row.Notice_Replay[0],
        Notification: row.Notification[0],
        Mobile1_Status: row.Mobile1_Status[0],
        Mobile2_Status: row.Mobile2_Status[0],
        Mobile3_Status: row.Mobile3_Status[0],
        ViewMessage: row.ViewMessage[0],
        CmpID: row.CmpID,
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0 ? "NOTICE FOUND SUCCESSFULLY" : "NOTICE NOT FOUND",
      StudNotice: noticeMain,
    };
  },

  getPublicNotice: async function (request) {
    if (!request.headers.cmpid) throw new Error("Parameters Incorrect!!!");
    let queryString =
      "select * from publicnotice where status=1 and expiry_date >= " +
      moment().format("YYYY-MM-DD") +
      " and (cmp_id in (0," +
      request.headers.cmpid +
      "))";

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0
          ? "PUBLIC NOTICE FOUND SUCCESSFULLY"
          : "PUBLIC NOTICE NOT FOUND",
      PublicNotice: result,
    };
  },

  getNoticeMobilebased: async function (request) {
    let noticeType = undefined,
      show = undefined;
    if (!request.headers.show) show = "0";
    else if (request.headers.show === "All") show = "0,1";
    else if (request.headers.show === "New") show = "0";
    else show = "0";

    if (!request.headers.noticetype) noticeType = "%";
    else if (request.headers.noticetype)
      noticeType = request.headers.noticetype;

    if (
      !request.headers.cmpkey ||
      !request.headers.memid ||
      !request.headers.mobile
    )
      throw new Error("Parameters Incorrect!!!");
    let mobileSelect = "",
      mobileStatus = "";

    if (request.headers.mobileno === "1") {
      mobileSelect = "m.Mobile1";
      mobileStatus = "Mobile1_Status";
    } else if (request.headers.mobileno === "2") {
      mobileSelect = "m.Mobile2";
      mobileStatus = "Mobile2_Status";
    } else if (request.headers.mobileno === "3") {
      mobileSelect = "m.Mobile3";
      mobileStatus = "Mobile3_Status";
    } else throw new Error("Parameters Incorrect!!!");

    let queryString =
      "Select DATE_FORMAT(g.Notice_Date,'%Y-%m-%d %H:%i:%s') AS Notice_Date,g.Std,g.Division,g.Notice_Type," +
      "g.Notice_Msg,g.File1,g.File2,g.File3,g.File1Type,g.File2Type,g.File3Type,g.Replay_Type," +
      "g.Notice_Replay,g.Notification,gd.Mem_ID,gd.Mobile1_Status,gd.Mobile2_Status,gd.Mobile3_Status," +
      "gd.Mobile1_Status as ViewMessage,c.Cmp_ID From generalnoticedetails gd" +
      " inner join generalnotice g on g.Notice_ID = gd.Notice_ID inner join Member m on m.Mem_ID =" +
      " gd.Mem_ID inner join company c on c.Cmp_ID = m.Cmp_ID Where c.Cmp_Key=N'" +
      request.headers.cmpkey +
      "' and gd.Mem_ID=" +
      request.headers.memid +
      " and " +
      mobileSelect +
      "=N'" +
      request.headers.mobile +
      "' and g.Notice_Type like '" +
      noticeType +
      "' and " +
      mobileStatus +
      " in (" +
      show +
      ") ORDER BY g.Notice_ID ASC";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      let updateString =
        "update generalnoticedetails set " +
        mobileStatus +
        " = 1 Where Mem_ID = '" +
        request.headers.memid +
        "' and " +
        mobileStatus +
        " = 0";
      await pool.query(updateString);
    }

    let path = "";

    if (result.length > 0)
      path = basePath + "notice//" + result[0].Cmp_ID.toString().trim() + "//";

    let noticeMain = [];
    await helper.asyncForEach(result, async (row) => {
      let _File1 = null,
        _File2 = null,
        _File3 = null;

      if (
        row.File1 !== null &&
        row.File1.toString().trim().length > 10 &&
        row.File1.toString().trim() !== "VDI"
      ) {
        let exist = undefined;
        if (row.File1.toString().trim() === "") exist = false;
        else exist = await existFile(path + row.File1.toString().trim());

        if (exist) _File1 = await statFile(path + row.File1.toString().trim());
        else _File1 = "0";
      }
      if (
        row.File2 !== null &&
        row.File2.toString().trim().length > 10 &&
        row.File2.toString().trim() !== "VDI"
      ) {
        let exist = undefined;

        if (row.File2.toString().trim() === "")
          exist = await existFile(path + row.File2.toString().trim());
        else exist = false;

        if (exist) _File2 = await statFile(path + row.File2.toString().trim());
        else _File2 = "0";
      }

      if (
        row.File3 !== null &&
        row.File3.toString().trim().length > 10 &&
        row.File3.toString().trim() !== "VDI"
      ) {
        let exist = undefined;
        if (row.File3.toString().trim() === "") exist = false;
        else exist = await existFile(path + row.File3.toString().trim());

        if (exist) _File3 = await statFile(path + row.File3.toString().trim());
        else _File3 = "0";
      }

      noticeMain.push({
        Notice_Date: row.Notice_Date,
        Notice_Type: row.Notice_Type,
        Notice_Msg: row.Notice_Msg,
        File1: row.File1 === null ? "" : row.File1,
        File1Type: row.File1Type,
        File1Size: _File1 === null ? "0" : _File1["size"],

        File2: row.File2 === null ? "" : row.File1,
        File2Type: row.File2Type,
        File2Size: _File2 === null ? "0" : _File2["size"],

        File3: row.File3 === null ? "" : row.File3,
        File3Type: row.File3Type,
        File3Size: _File3 === null ? "0" : _File3["size"],
        Replay_Type: row.Replay_Type[0],
        Notice_Replay: row.Notice_Replay[0],
        Notification: row.Notification[0],
        Mobile1_Status: row.Mobile1_Status[0],
        Mobile2_Status: row.Mobile2_Status[0],
        Mobile3_Status: row.Mobile3_Status[0],
        ViewMessage: row.ViewMessage[0],
        CmpID: row.CmpID,
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0 ? "NOTICE FOUND SUCCESSFULLY" : "NOTICE NOT FOUND",
      StudNotice: noticeMain,
    };
  },

  setNotice: async function (request) {
    let _companyLockID = 1;
    let _companyLockKey = "key";
    let allProperties = [
      "Cmpkey",
      "MemID",
      "Standard",
      "Division",
      "Notice_Date",
      "Notice_Type",
      "Notice_Msg",
      "base64File1",
      "File1Type",
      "File1Ext",
      "base64File2",
      "File2Type",
      "File2Ext",
      "base64File3",
      "File3Type",
      "File3Ext",
      "Replay_Type",
      "Notice_Replay",
      "Notification",
      "Mobile1_Status",
      "Mobile2_Status",
      "Mobile3_Status",
    ];
    let studnotice = undefined;
    if (request.headers.studnotice) {
      try {
        studnotice = JSON.parse(request.headers.studnotice);
        for (let cnt = 0; cnt < allProperties.length; cnt++) {
          let element = allProperties[cnt];
          if (!studnotice.hasOwnProperty(element))
            return {
              Success: "0",
              Message: "Input parameter studnotice is not Notice Object !!!",
            };
          if (typeof studnotice[element] !== "string")
            return {
              Success: "0",
              Message:
                "Input parameter " +
                element +
                " property is not string type !!!",
            };
        }
      } catch (error) {
        return {
          Success: "0",
          Message: "Input parameter studnotice is not JSON string !!!",
        };
      }
    } else {
      return {
        Success: "0",
        Message: "Input JSON parameter studnotice not defined !!!",
      };
    }

    if (studnotice["Cmpkey"].trim() === _companyLockKey)
      return {
        Success: "0",
        Message:
          "THIS USER ONLY FOR DEMO \n YOU ARE NOT PUT REPLY IN THIS APPLICATION",
      };

    let queryString =
      "Select Cmp_Id from Company Where cmp_key=N'" + studnotice.Cmpkey + "'";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      cmp_id = result[0].Cmp_Id;
      let path,
        file1 = "",
        file2 = "",
        file3 = "";
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let _dtNotice = moment(studnotice.Notice_Date);

        if (!_dtNotice.isValid()) throw new Error("Notice Date is not valid");

        let insertString =
          "Insert into `generalnotice`(`Cmp_ID`,`Notice_Date`,`Std`,`Division`,`Notice_Msg`," +
          "`File1`,`File1Type`,`File2`,`File2Type`,`File3`,`File3Type`,`Replay_Type`,`Notice_Replay`," +
          "`Notification`) values(" +
          cmp_id +
          ",N'" +
          _dtNotice.format("YYYY-MM-DD HH:mm:ss") +
          "',N'" +
          studnotice.Standard +
          "',N'" +
          studnotice.Division +
          "',N'" +
          studnotice.Notice_Msg +
          "',N'" +
          file1 +
          "',N'" +
          studnotice.File1Type +
          "',N'" +
          file2 +
          "',N'" +
          studnotice.File2Type +
          "',N'" +
          file3 +
          "',N'" +
          studnotice.File3Type +
          "',0,1,0)";

        result = await connection.query(insertString);

        if (result.length) result = result[0];

        let _noticeid = result.insertId;
        if (_noticeid > 0) {
          insertString =
            "Insert into `generalnoticedetails`(`Notice_ID`,`Mem_ID`,`Mobile1_Status`,`Mobile2_Status`," +
            "`Mobile3_Status`) values(" +
            _noticeid +
            "," +
            studnotice.MemID +
            ",0,0,0)";
          result = await connection.query(insertString);

          if (result.length) result = result[0];
          let _id = result.insertId;

          if (_id > 0) {
            await connection.commit();
            if (connection) connection.release();
            return {
              Success: "1",
              Message: "NOTICE ADD SUCCESSFULLY",
            };
          } else throw new Error("NOTICE DETAILS NOT ADDED SUCCESSFULLY");
        } else throw new Error("NOTICE NOT ADDED SUCCESSFULLY");
      } catch (error) {
        await connection.rollback();
        if (connection) connection.release();
        return {
          Success: "0",
          Message: error.message,
        };
      }
    } else
      return {
        Success: "0",
        Message: "COMPANY NOT FOUND",
      };
  },

  getChat: async function (request) {
    let show = undefined;

    if (!request.headers.show) show = "0";
    else if (request.headers.show === "All") show = "0,1";
    else if (request.headers.show === "New") show = "0";
    else show = "0";

    if (
      !request.headers.cmpkey ||
      !request.headers.memid ||
      !request.headers.mobile
    )
      return {
        Success: "0",
        Message: "Wrong Input Parameters",
      };
    let queryString =
      " Select DATE_FORMAT(c.Chat_Date,'%Y-%m-%d') AS Chat_Date,c.Std,c.Division,c.Chat_Msg," +
      "c.File1,c.File1Type,c.Replay_Type,c.View_Msg,c.Notification,c.Mem_ID," +
      "c.Mobile1_Status as ViewMessage,c.Cmp_ID From chat c" +
      " inner join Member m on m.Mem_ID = c.Mem_ID inner join company cp on c.Cmp_ID = m.Cmp_ID" +
      " Where cp.Cmp_Key=N'" +
      request.headers.cmpkey +
      "' and c.Mem_ID=" +
      request.headers.memid +
      " and m.Mobile1=" +
      request.headers.mobile +
      " and Mobile1_Status in (" +
      show +
      ") ORDER BY c.Chat_ID ASC";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      let updateString =
        "update chat set Mobile1_Status = 1 Where Mem_ID = '" +
        request.headers.memid +
        "' and Mobile1_Status = 0";
      await pool.query(updateString);
    } else if (result.length === 0) {
      queryString =
        " Select DATE_FORMAT(c.Chat_Date,'%Y-%m-%d') AS Chat_Date,c.Std,c.Division,c.Chat_Msg," +
        "c.File1,c.File1Type,c.Replay_Type,c.View_Msg,c.Notification,c.Mem_ID," +
        "c.Mobile1_Status as ViewMessage,c.Cmp_ID From chat c" +
        " inner join Member m on m.Mem_ID = c.Mem_ID inner join company cp on c.Cmp_ID = m.Cmp_ID" +
        " Where cp.Cmp_Key=N'" +
        request.headers.cmpkey +
        "' and c.Mem_ID=" +
        request.headers.memid +
        " and m.Mobile2=" +
        request.headers.mobile +
        " and Mobile2_Status in (" +
        show +
        ") ORDER BY c.Chat_ID ASC";

      result = await pool.query(queryString);

      if (result.length > 0) {
        updateString =
          "update chat set Mobile2_Status = 1 Where Mem_ID = '" +
          request.headers.memid +
          "' and Mobile2_Status = 0";

        await pool.query(updateString);
      } else if (result.length === 0) {
        queryString = queryString =
          " Select DATE_FORMAT(c.Chat_Date,'%Y-%m-%d') AS Chat_Date,c.Std,c.Division,c.Chat_Msg," +
          "c.File1,c.File1Type,c.Replay_Type,c.View_Msg,c.Notification,c.Mem_ID," +
          "c.Mobile1_Status as ViewMessage,c.Cmp_ID From chat c" +
          " inner join Member m on m.Mem_ID = c.Mem_ID inner join company cp on c.Cmp_ID = m.Cmp_ID" +
          " Where cp.Cmp_Key=N'" +
          request.headers.cmpkey +
          "' and c.Mem_ID=" +
          request.headers.memid +
          " and m.Mobile3=" +
          request.headers.mobile +
          " and Mobile3_Status in (" +
          show +
          ") ORDER BY c.Chat_ID ASC";

        result = await pool.query(queryString);

        if (result.length > 0) {
          updateString =
            "update chat set Mobile3_Status = 1 Where Mem_ID = '" +
            request.headers.memid +
            "' and Mobile3_Status = 0";
          await pool.query(updateString);
        }
      }
    }

    let path = "";

    if (result.length > 0)
      path = basePath + "notice//" + result[0].Cmp_ID.toString().trim() + "//";

    let noticeChat = [];
    await helper.asyncForEach(result, async (row) => {
      let _File1 = null;

      if (
        row.File1 !== null &&
        row.File1.toString().trim().length > 10 &&
        row.File1.toString().trim() !== "VDI"
      ) {
        let exist = false;

        if (row.File1.toString().trim() !== "")
          exist = await existFile(path + row.File1.toString().trim());

        if (exist) _File1 = await statFile(path + row.File1.toString().trim());
        else _File1 = "0";
      }

      noticeChat.push({
        Chat_Date: row.Chat_Date,
        Chat_Msg: row.Chat_Msg,
        File1: row.File1 === null ? "" : row.File1,
        File1Type: row.File1Type,
        Replay_Type: row.Replay_Type[0],
        Notification: row.Notification[0],
        View_Msg: row.View_Msg[0],
        ViewMessage: row.ViewMessage[0],
        CmpID: row.CmpID,
      });
    });

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "CHAT FOUND SUCCESSFULLY" : "CHAT NOT FOUND",
      StudChat: noticeChat,
    };
  },

  setChat: async function (request) {
    let _companyLockID = 1;
    let _companyLockKey = "key";
    let allProperties = [
      "Cmpkey",
      "MemID",
      "Standard",
      "Division",
      "Chat_Date",
      "Chat_Msg",
      "base64File1",
      "File1Type",
      "File1Ext",
      "Replay_Type",
      "View_Msg",
      "Notification",
      "Mobile1_Status",
      "Mobile2_Status",
      "Mobile3_Status",
    ];
    let studchat = undefined;
    if (request.headers.studchat) {
      try {
        studchat = JSON.parse(request.headers.studchat);
        for (let cnt = 0; cnt < allProperties.length; cnt++) {
          let element = allProperties[cnt];
          if (!studchat.hasOwnProperty(element))
            return {
              Success: "0",
              Message: "Input parameter studchat is not Chat Object !!!",
            };
          if (typeof studchat[element] !== "string")
            return {
              Success: "0",
              Message:
                "Input parameter " +
                element +
                " property is not string type !!!",
            };
        }
      } catch (error) {
        return {
          Success: "0",
          Message: "Input parameter studchat is not JSON string !!!",
        };
      }
    } else {
      return {
        Success: "0",
        Message: "Input JSON parameter studchat not defined !!!",
      };
    }

    if (studchat["Cmpkey"].trim() === _companyLockKey)
      return {
        Success: "0",
        Message:
          "THIS USER ONLY FOR DEMO \n YOU ARE NOT PUT REPLY IN THIS APPLICATION",
      };

    let queryString =
      "Select Cmp_Id from Company Where cmp_key=N'" + studchat.Cmpkey + "'";

    let result = await pool.query(queryString);

    if (result.length > 0) {
      cmp_id = result[0].Cmp_Id;
      let path,
        file1 = "",
        file2 = "",
        file3 = "";
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let _dtChat = moment(studchat.Chat_Date);

        if (!_dtChat.isValid()) throw new Error("Chat Date is not valid");

        let insertString =
          "Insert into `chat`(`Cmp_ID`,`Mem_ID`,`Chat_Date`,`Std`,`Division`,`Chat_Msg`," +
          "`File1`,`File1Type`,`Replay_Type`,`View_Msg`,`Notification`) values(" +
          cmp_id +
          "," +
          studchat.MemID +
          ",N'" +
          _dtChat.format("YYYY-MM-DD HH:mm:ss") +
          "',N'" +
          studchat.Standard +
          "',N'" +
          studchat.Division +
          "',N'" +
          studchat.Chat_Msg +
          "',N'" +
          file1 +
          "',N'" +
          studchat.File1Type +
          "'," +
          "0,1,0)";

        result = await connection.query(insertString);

        if (result.length) result = result[0];

        let _chatid = result.insertId;
        if (_chatid > 0) {
          await connection.commit();
          if (connection) connection.release();
          return {
            Success: "1",
            Message: "CHAT ADD SUCCESSFULLY",
          };
        } else throw new Error("CHAT NOT ADDED SUCCESSFULLY");
      } catch (error) {
        await connection.rollback();
        if (connection) connection.release();
        return {
          Success: "0",
          Message: error.message,
        };
      }
    } else
      return {
        Success: "0",
        Message: "COMPANY NOT FOUND",
      };
  },

  setLastVisit: async function (request) {
    if (request.headers.memid === "" || request.headers.memid === null) {
      return {
        Success: "0",
        Message: "Error in Member ID",
      };
    }

    if (!request.headers.visitdate || !request.headers.memid)
      throw new Error("Parameters Incorrect!!!");

    let visitdate = moment(request.headers.visitdate);

    if (!visitdate.isValid()) {
      return {
        Success: "0",
        Message: "Error in Visit Date",
      };
    }

    let updateString =
      "Update Member Set LastView='" +
      visitdate.format("YYYY-MM-DD HH:mm:ss") +
      "' Where Mem_Id='" +
      request.headers.memid +
      "'";

    let result = await pool.query(updateString);

    if (result.length) result = result[0];
    if (result.affectedRows === 1)
      return {
        Success: "1",
        Message: "Member Visit Updated",
      };
    else
      return {
        Success: "0",
        Message: "Member Visit Not Updated",
      };
  },

  getPhotoGallery: async function (request) {
    let std = undefined,
      division = undefined,
      subject = undefined;
    let cmp_id = undefined;
    if (request.headers.cmpkey === "" || request.headers.cmpkey === null) {
      return {
        Success: "0",
        Message: "Error in Company Key",
      };
    } else {
      let queryString =
        "select cmp_id from company where cmp_key='" +
        request.headers.cmpkey +
        "'";
      let result = await pool.query(queryString);
      if (result.length === 0)
        return {
          Success: "0",
          Message: "Company Not Found",
        };
      else cmp_id = result[0].cmp_id;
    }
    if (request.headers.std)
      std = "'" + request.headers.std.toString().trim() + "','All'";
    else std = "'All'";
    if (request.headers.division)
      division = "'" + request.headers.division.toString().trim() + "','All'";
    else division = "'All'";
    if (request.headers.subject)
      subject = "'" + request.headers.subject.toString().trim() + "','All'";
    else subject = "'All'";

    let queryString =
      "Select Cmp_ID,Std,Division,Title,Photo,Subject from photogallery" +
      " Where Std in (" +
      std +
      ") and Division in (" +
      division +
      ") and Subject in (" +
      subject +
      ") and Cmp_Id=" +
      cmp_id;

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "PHOTOS FOUND" : "PHOTOS NOT FOUND",
      Photos: result,
    };
  },

  getVideoGallery: async function (request) {
    let std = undefined,
      division = undefined,
      subject = undefined;
    let cmp_id = undefined;
    if (request.headers.cmpkey === "" || request.headers.cmpkey === null) {
      return {
        Success: "0",
        Message: "Error in Company Key",
      };
    } else {
      let queryString =
        "select cmp_id from company where cmp_key='" +
        request.headers.cmpkey +
        "'";
      let result = await pool.query(queryString);
      if (result.length === 0)
        return {
          Success: "0",
          Message: "Company Not Found",
        };
      else cmp_id = result[0].cmp_id;
    }
    if (request.headers.std)
      std = "'" + request.headers.std.toString().trim() + "','All'";
    else std = "'All'";
    if (request.headers.division)
      division = "'" + request.headers.division.toString().trim() + "','All'";
    else division = "'All'";
    if (request.headers.subject)
      subject = "'" + request.headers.subject.toString().trim() + "','All'";
    else subject = "'All'";

    let queryString =
      "Select Cmp_ID,Std,Division,Title,Video from videogallery" +
      " Where Std in (" +
      std +
      ") and Division in (" +
      division +
      ") and Subject in (" +
      subject +
      ") and Cmp_Id=" +
      cmp_id;

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "VIDEOS FOUND" : "VIDEOS NOT FOUND",
      Videos: result,
    };
  },

  getPDFGallery: async function (request) {
    let std = undefined,
      division = undefined,
      subject = undefined;
    let cmp_id = undefined;
    if (request.headers.cmpkey === "" || request.headers.cmpkey === null) {
      return {
        Success: "0",
        Message: "Error in Company Key",
      };
    } else {
      let queryString =
        "select cmp_id from company where cmp_key='" +
        request.headers.cmpkey +
        "'";
      let result = await pool.query(queryString);
      if (result.length === 0)
        return {
          Success: "0",
          Message: "Company Not Found",
        };
      else cmp_id = result[0].cmp_id;
    }
    if (request.headers.std)
      std = "'" + request.headers.std.toString().trim() + "','All'";
    else std = "'All'";
    if (request.headers.division)
      division = "'" + request.headers.division.toString().trim() + "','All'";
    else division = "'All'";
    if (request.headers.subject)
      subject = "'" + request.headers.subject.toString().trim() + "','All'";
    else subject = "'All'";

    let queryString =
      "Select Cmp_ID,Std,Division,Title,File from pdfdownload" +
      " Where Std in (" +
      std +
      ") and Division in (" +
      division +
      ") and Subject in (" +
      subject +
      ") and Cmp_Id=" +
      cmp_id;

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "PDF FOUND" : "PDF NOT FOUND",
      PDF: result,
    };
  },

  getExam: async function (request) {
    let std = undefined,
      division = undefined;
    let cmp_id = undefined;
    let type = undefined;

    if (
      !request.headers.std ||
      !request.headers.division ||
      !request.headers.cmpkey
    )
      throw new Error("Parameters Incorrect!!!");
    month =
      "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(request.headers.month) /
        3 +
      1;
    // if (request.headers.type && request.headers.type.toString().trim() !== "")
    //   type = request.headers.type;
    // else type = "%";

    if (request.headers.cmpkey === "" || request.headers.cmpkey === null) {
      return {
        Success: "0",
        Message: "Error in Company Key",
      };
    } else {
      let queryString =
        "select cmp_id from company where cmp_key='" +
        request.headers.cmpkey +
        "'";
      let result = await pool.query(queryString);
      if (result.length === 0)
        return {
          Success: "0",
          Message: "Company Not Found",
        };
      else cmp_id = result[0].cmp_id;
    }
    if (request.headers.std)
      std = "'" + request.headers.std.toString().trim() + "','All'";
    else std = "'All'";
    if (request.headers.division)
      division = "'" + request.headers.division.toString().trim() + "','All'";
    else division = "'All'";

    let queryString =
      "Select Exam_ID,DATE_FORMAT(Date,'%Y-%m-%d') AS Date,Std,Division,Time,Subject,Type,Remarks,Admin_ID,YEAR(date) AS 'year', MONTH(DATE) AS 'month' from exam" +
      " Where Std in (" +
      std +
      ") and Division in (" +
      division +
      ") and Cmp_Id=" +
      cmp_id +
      " and MONTH(DATE)=" +
      month;

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message: result.length > 0 ? "EXAM FOUND" : "EXAM NOT FOUND",
      Exam: result,
    };
  },

  subjectList: async function (request) {
    if (!request.headers.std || !request.headers.cmpkey)
      throw new Error("Parameters Incorrect!!!");

    if (request.headers.cmpkey === "" || request.headers.cmpkey === null) {
      return {
        Success: "0",
        Message: "Error in Company Key",
      };
    }

    let queryString =
      "SELECT s.* FROM subject s INNER JOIN company c ON c.Cmp_ID=s.Cmp_ID WHERE c.cmp_key='" +
      request.headers.cmpkey +
      "' AND s.std='" +
      request.headers.std +
      "'";

    let result = await pool.query(queryString);

    return {
      Success: result.length > 0 ? "1" : "0",
      Message:
        result.length > 0 ? "SUBJECT LIST FOUND" : "SUBJECT LIST NOT FOUND",
      Exam: result,
    };
  },
};
