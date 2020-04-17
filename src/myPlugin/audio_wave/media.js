/**
 * @file 读取音频数据
 * Created by panxiaoxiao on 2020/04/13.
 */
var loadMediaMap = [];
var media = media || function (){
	function g(a, b) {
		b = b || a.length;
		return function() {
			var c = e.call(arguments),
				d = c.length;
			return d < b ? g(function() {
				var b = e.call(arguments);
				return a.apply(null, [].concat(c, b))
			}, b - d) : a.apply(null, c)
		}
	}
	var e = Array.prototype.slice,
		k = function(a) {
			a = new Uint8Array(a);
			var b = 2 + a[0],
				c = g(function(a, b) {
					return [].concat(Object.keys(Array.apply(null, {
						length: Math.ceil(b.length / a)
					})).map(Number).map(function(c) {
						return b.slice(c * a, (c + 1) * a)
					}))
				}),
				d = g(function(a, b, c) {
					c = c.slice();
					var d = c[a];
					c[a] = c[b];
					c[b] = d;
					return c
				}),
				h = c(2)(a.slice(2, b)),
				f = function(a) {
					return function() {
						var b = e.call(arguments),
							c = b.reduce(function(a, b) {
								return a + b.length
							}, 0),
							d = new a(c);
						b.reduce(function(a, b) {
							d.set(b, a);
							return a + b.length
						}, 0);
						return d
					}
				}(Uint8Array);
			h = g(function(a, b) {
				return 10 <= b.length ? a.reduceRight(function(a, b) {
					return d(b[0], b[1])(a)
				}, b) : b
			})(h);
			return f.apply(null, c(1E4)(a.slice(b)).map(h)).buffer
		},
		f = null,
		q = function(a) {
			f && (f.abort(), f = a)
		},
		l = function(a) {
			var b = $.Deferred();
			if ("string" !== typeof a) return b.reject(new TypeError("fetchArrayBuffer(...): Invalid argument passed as url. Expected a string. Instead receive: " + typeof a));
			loadMediaMap && loadMediaMap[a] && (loadMediaMap[a].xhr.abort(), loadMediaMap[a] = null);
			var c = new XMLHttpRequest;
			loadMediaMap[a] = {
				xhr: c
			};
			q(c);
			c.open("GET", a, !0);
			c.responseType = "arraybuffer";
			c.onload = function() {
				var a = c.status;
				200 <= a && 300 > a || 304 === a ? b.resolve(c.response) : b.reject(Error("fetchArrayBuffer(...): " + c.statusText))
			};
			c.onerror = function() {
				b.reject(Error("fetchArrayBuffer(...): " + c.statusText))
			};
			c.send();
			return b
		},
		m = function(a) {
			return URL.createObjectURL(new Blob([a]))
		},
		n = function(a) {
			a instanceof $ && (a = a[0]);
			var b = $.Deferred();
			if (!(a instanceof HTMLAudioElement || a instanceof HTMLVideoElement)) return b.reject(new TypeError("replaceEncryptedMediaSrc(...): Invalid argument. Expected an HTMLAudioElement or HTMLVideoElement"));
			var c = a.dataset.src;
			if (!a.dataset.src) return b.reject(Error("replaceEncryptedMediaSrc(...): Invalid argument. Attribute data-src is required in media element"));
			l(c).then(function(c) {
				var d = a.dataset.src;
				c = a.classList.contains("encrypted") ? k(c) : c;
				d = a.autoplay;
				a.autoplay = null;
				a.src = m(c);
				d && a.play();
				b.resolve(c)
			}, b.reject.bind(b));
			return b
		};
	return {
		fetchArrayBuffer: l,
		mapArrayBufferToURL: m,
		get: k,
		load: function() {
			var a = e.call(arguments);
			1 === a.length && (a = a[0]);
			var b = e.call(a);
			return b.length ? b.map(n) : n(a)
		}
	};
}();
export default media;