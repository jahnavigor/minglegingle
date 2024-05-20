exports.welcomeEmail = function(result, callback) {
    var template = `
    <html>
        <head>
            <title>
                Testing NodeJs Templates
            </title>
        </head>
        <body>
            <h4>Hello ${result.first_name}</h4><br>
            <p>Thank you for signing up with NOdeJs community.</p><br>
            <p>This is just a testing</p><br>
            <p>otp for verification is : ${result.otp}</p>
            <p>Thank You,</p><br>
            <p>NodeJs Team</p><br>
        </body>
    </html>
    `;
    callback(template);
}
exports.forgotPassword = function(result, callback) {
    var resetLink = result.url;
    console.log(resetLink) // Replace 'example.com' with your actual domain
    var template = `
    <html>
        <head>
            <title>
                Forgot Password
            </title>
        </head>
        <body>
            <h4>Hello ${result.first_name},</h4><br>
            <p>We received a request to reset your password.</p><br>
            <p>Please click on the following link to reset your password:</p><br>
            <a href="${resetLink}">Reset Password</a><br><br>
            <p>If you didn't request this, you can ignore this message.</p><br>
            <p>Thank you for using our services.</p><br>
            <p>Sincerely,</p><br>
            <p>ToStyleMou Team</p><br>
        </body>
    </html>
    `;
    callback(template);
}
exports.resendotp = function(result, callback) {
    var template = `
    <html>
        <head>
            <title>
                Resend OTP Email
            </title>
        </head>
        <body>
            <h4>Hello</h4><br>
            <p>You requested to resend the OTP for your account.</p><br>
            <p>Here is your new OTP for verification: ${result.otp}</p>
            <p>If you didn't request this OTP, please ignore this email.</p><br>
            <p>Thank You,</p>
            <p>NodeJs Team</p>
        </body>
    </html>
    `;
    callback(template);
}


