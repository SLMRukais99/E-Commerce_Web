const nodemailer = require("nodemailer");

const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {//to fetch our dynamic data, we have to pass this data before the request, if we pass the the after the response it will not work
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ID, //  companyta email id kutukura. env file la iruku
      pass: process.env.MP, // அந்த email id-க்கு சேர்ந்த App Password, antha email id password illa, //kaxw wqyh ujpz ynif - ithan appa passaord


      /*
ஆமா! ✅
அதுல (i.e., process.env.MAIL_ID) நம்ம usually admin's email id அல்லது application-க்கு allocate பண்ணப்பட்ட ஒரு dedicated email id தான் கொடுப்போம்.
server la irunthu user kku email anupathan intha set up


      */
    },
  });

  // send mail with defined transport object, meluku create ana transporter than send pannum datatve
  let info = await transporter.sendMail({
    from: '"Hey 👻" <abc@gmail.com>', // sender address, ithu just string sumaa meluku kututha emaila string aha poturam
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.htm, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
});

module.exports = sendEmail;
