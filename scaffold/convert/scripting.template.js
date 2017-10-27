'use strict';

// START: HEADER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v<%= VERSION %>
const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const crypto = require('crypto');
const async = require('async');
const moment = require('moment-timezone');
const DOMParser = require('zapier-platform-interpreter/dom-parser');
const XMLSerializer = require('zapier-platform-interpreter/xml-serializer');
const atob = require('zapier-platform-interpreter/atob');
const btoa = require('zapier-platform-interpreter/btoa');
const z = require('zapier-platform-interpreter/z');
const $ = require('zapier-platform-interpreter/$');
const {
  ErrorException,
  HaltedException,
  StopRequestException,
  ExpiredAuthException,
  RefreshTokenException,
  InvalidSessionException,
} = require('zapier-platform-interpreter/exceptions');
// END: HEADER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v<%= VERSION %>

<%= CODE %>

// START: FOOTER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v<%= VERSION %>
module.exports = Zap;
// END: FOOTER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v<%= VERSION %>
