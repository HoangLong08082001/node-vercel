const winston = require('winston')

const logs=[]

const loggers = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports:[
    new winston.transports.File({
      level:'info',
      filename:'info.log',
      format:winston.format.json()
    })
  ]
})

const logger = (newLog) => {
  loggers.info(newLog);
}


module.exports = logger;
