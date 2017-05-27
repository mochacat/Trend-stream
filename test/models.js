'use strict'

import request from 'supertest'
import http from 'http'
import {should} from 'chai'
import config from '../config'
import app from '../server.js'

const base_url = 'http://localhost:' + config.port
//app.listen(base_url)


