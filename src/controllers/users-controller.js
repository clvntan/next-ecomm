import express from "express"
import bcrypt from "bcryptjs" // bcryptjs
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import { validateUser } from "../validators/users.js"
import { filterUser } from "../utils/common.js"
const router = express.Router()

// create users
router.post('/', (req, res) => {
    const data = req.body
  
    const validationErrors = validateUser(data)
  
    if (Object.keys(validationErrors).length != 0) return res.status(400).send({
      error: validationErrors
    })
  
    data.password = bcrypt.hashSync(data.password, 8); // bcryptjs
    prisma.user
      .create({
        data,
      })
      .then((user) => {
        return res.json(filterUser(user, 'id', 'name', 'email'));
      })
      .catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const formattedError = {}
            formattedError[`${err.meta.target[0]}`] = 'already taken'
      
            return res.status(500).send({
              error: formattedError
            });  // friendly error handling
          }
          throw err  // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
        })
  });
  
export default router
