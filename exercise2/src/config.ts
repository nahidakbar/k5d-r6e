require('dotenv').config()

export const port = process.env.PORT ? parseInt(process.env.PORT) : 8080

export const basicAuthUsername = process.env.BASIC_AUTH_USERNAME
export const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD
