'use strict'
import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  // res.render('index')
  res.sendStatus(200)
})

export default router
