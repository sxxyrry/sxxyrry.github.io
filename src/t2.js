const nodemailer = require('nodemailer');

// 创建SMTP传输器
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com', // 163邮箱的SMTP服务器地址
    port: 465, // SMTP端口，163邮箱使用465端口（SSL）
    secure: true, // 使用SSL
    auth: {
        user: 'sxxyrry_23XR@163.com', // 你的163邮箱地址
        pass: 'your_password' // 你的163邮箱密码或授权码
    }
});

// 邮件内容
const mailOptions = {
    from: 'your_email@163.com', // 发件人地址
    to: 'recipient@example.com', // 收件人地址
    subject: '测试邮件', // 邮件主题
    text: '这是一封测试邮件，使用Node.js发送。' // 邮件正文
};

// 发送邮件
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('发送邮件失败:', error);
    } else {
        console.log('邮件已发送:', info.response);
    }
});