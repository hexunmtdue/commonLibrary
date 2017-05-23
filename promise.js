(function(win) {
	var promise = function(callback) {
		return new promise.fn.init(callback);
	};
	promise.fn = promise.prototype = {
		init: function(callback) {
			var self = this,
				resolve = function() {
					self.thenArgs = arguments;
				},
				reject = function() {
					self.catchArgs = arguments;
				};
			this.emi = [];
			callback && callback.call(this, resolve, reject);
			return this;
		},
		then: function(callback) {
			if (!this.stop) {
				this.emi.push({
					callback: callback,
					args: this.thenArgs,
					type: "then"
				});
				emi.call(this, 0, this.emi);
			}
			return this;
		},
		fail: function(callback) {
			this.emi.fail = {
				callback: callback,
				args: this.catchArgs
			};
			emi.call(this, 0, this.emi);
			return this;
		},
		always: function(callback) {
			this.emi.always = {
				callback: callback,
				args: this.thenArgs || this.catchArgs
			};
			emi.call(this, 0, this.emi);
			return this;
		}
	};
	promise.fn.init.prototype = promise.fn;
	promise.extend = function(target, args) {
		target = target || {}
		for (name in args) {
			target[name] = args[name];
		}
		return target;
	}
	promise.extend(promise.fn, {
		wait: function(ms) {
			this.emi.push({
				callback: function(callback) {
					setTimeout(function() {
						callback && callback()
					}, ms * 1000);
				},
				type: "wait"
			});
			return this;
		}
	});
	Array.prototype.delete = function(num) {
		this.splice(num, 1);
		return this;
	};
	var emi = function(n, arr) {
		var self = this;
		if (this.catchArgs) {
			this.emi.fail && this.emi.fail.callback && (this.emi.fail.callback.call(this, this.catchArgs && this.catchArgs[0] || this.catchArgs), this.emi.fail = null);
			this.emi.always && this.emi.always.callback && this.emi.always.callback.call(this, this.thenArgs || this.catchArgs, this.emi.always = null);
			return;
		} else if (arr.length > 0) {
			var _emi = function(n, arr) {
				if (arr.length > 0) {
					var self = this,
						item = arr[n];
					if (item.type == "wait") {
						item.callback(function() {
							arr.delete(n);
							_emi.call(self, n, arr);
						});
					} else {
						try {
							item.callback && item.callback.apply(self, item.args);
						} catch (e) {
							console.log(e);
						} finally {
							arr.delete(n);
							_emi.call(self, n, arr);
						}
					}
				} else {
					this.emi.always && this.emi.always.callback && (this.emi.always.callback.call(this, this.thenArgs || this.catchArgs), this.emi.always = null);
				}
			}
			_emi.call(self, n, arr);
		}
	};
	var when = function() {
		var obj = (new when.fn.init());
		obj.set.apply(obj, arguments);
		return obj;
	};
	when.fn = when.prototype = {
		init: function() {
			this.emi = [];
			return this;
		},
		set: function() {
			var args = arguments,
				len = args.length,
				i;
			for (i = 0; i < len; i++) this.emi.push({
				callback: function(callback) {
					return promise(function(resolve, reject) {
						if (typeof callback == "function") {
							callback(resolve, reject);
						} else {
							try {
								resolve(callback);
							} catch (e) {
								reject(e.message);
							}
						}
					});
				},
				args: args[i]
			});
			return this;
		}
	};
	promise.extend(when.fn, {
		done: function(callback) {
			this.emi.then = callback;
			whenEmi.call(this, "then");
			return this;
		},
		fail: function(callback) {
			this.emi.fail = callback;
			whenEmi.call(this, "fail");
			return this;
		}
	});
	var whenEmi = function(type) {
		var self = this,
			len = self.emi.length,
			i, x,
			thenLen = self.emi.then.length || 0;
		for (i = 0; i < len; i++) {
			self.emi[i].callback ? (self.emi[i] = self.emi[i].callback(self.emi[i].args), self.emi[i][type](self.emi[type])) : self.emi[i][type](self.emi[type]);
		}
	}
	when.fn.init.prototype = when.fn;
	promise.when = when;
	win._promise = promise;
})(this);
/*  promise
	promise(function(resolve 成功, reject 错误){})
		.then(function(返回值){}) 成功后执行
		.wait(等待秒数) 等待
		.fail(function(错误值){}) 错误后执行
		.always(function(){}) 无论成功或错误都要执行
	promise.when(function(){}, string, ...) 参数无限制
		.done(function(返回值){}) 成功后执行
		.fail(function(错误值){}) 错误后执行
*/