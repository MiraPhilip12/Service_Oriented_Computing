module.exports = {
    jwtSecret: process.env.JWT_SECRET || '0774a2cb1d1c5cc1569e114091482b019e8f922c947d86b2be864404310a3903',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
};