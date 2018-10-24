function WSHandler() {
  this.host = location.host;
  this.conn = null;
  this.connected = null;
  this.disconnected = null;
  this.eventEmitter = new window.TopologyORegistry.eventEmitter();
}

WSHandler.prototype = {

  connect: function() {
    var self = this;

    if (this.conn && this.conn.readyState == WebSocket.OPEN) {
      return;
    }

    this._connect();
  },

  _connect: function() {
    var self = this;

    this.connected = $.Deferred();
    this.connected.then(function() {
      self.eventEmitter.emit('connected');      
    });
    this.disconnected = $.Deferred();
    this.disconnected.then(function() {
      self.eventEmitter.emit('disconnected');      
    });
    this.connecting = true;

    this.protocol = "ws://";
    if (location.protocol == "https:") {
      this.protocol = "wss://";
    }
    this.conn = new WebSocket(this.protocol + this.host + "/ws/subscriber?x-client-type=webui");
    this.conn.onopen = function() {
      self.connecting = false;
      self.connected.resolve(true);
    };
    this.conn.onclose = function() {
      // connection closed after a succesful connection
      if (self.connecting === false) {
        self.disconnected.resolve(true);
        // client never succeed to connect in the first place
      } else {
        self.connecting = false;
        self.connected.reject(false);
      }
    };
    this.conn.onmessage = function(r) {
      var msg = JSON.parse(r.data);
      console.log('Websocket message', msg);
      self.eventEmitter.emit('message.' + msg.Namespace, msg);
    };
    this.conn.onerror = function(r) {
      self.eventEmitter.emit('error');      
    };
  },

  disconnect: function() {
    this.conn && this.conn.close();
  },

  addMsgHandler: function(namespace, callback) {
    this.eventEmitter.on('message.' + namespace, callback);
  },

  removeMsgHandler: function(namespace, callback) {
    this.eventEmitter.removeListener('message.' + namespace, callback);
  },

  addConnectHandler: function(callback, once) {
    var self = this;
    if (!this.connecting && this.conn && this.conn.readyState == WebSocket.OPEN) {
      callback();
      return;
    }
    if (once) {
      this.eventEmitter.once('connected', callback);
    } else {
      this.eventEmitter.on('connected', callback);
    }
  },

  delConnectHandler: function(callback) {
    this.eventEmitter.removeListener('disconnected', callback);
  },

  addDisconnectHandler: function(callback) {
    var self = this;
    if (!this.connecting && this.conn && this.conn.readyState == WebSocket.OPEN) {
      self.eventEmitter.emit('disconnected');      
      return;
    }
    this.eventEmitter.on('disconnected', callback);
  },

  addErrorHandler: function(callback) {
    this.eventEmitter.on('error', callback);
  },

  send: function(msg) {
    this.conn.send(JSON.stringify(msg));
  }

};
