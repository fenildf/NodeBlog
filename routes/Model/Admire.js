var commonDao = require("./CommonDAO.js"),
	collectionName = "admire",
	uuid = require("node-uuid"),
	__resultToListFn = function(callback) {
		return function(err, results) {
			var i;
			if (err) return callback(err);
			for (i = results.length; i--;) {
				results[i] = new Admire(results[i]);
			}
			callback(err, results);

		};
	};

function Admire(admire) {
	this.username = admire.username;
	this.commentId = admire.commentId;
	this.time = admire.time;
	this.id = admire.id;
}

module.exports = Admire;

Admire.prototype.save = function(callback) {
	commonDao.save(collectionName, {
		username: this.username,
		commentId: this.commentId,
		time: new Date().getTime(),
		id: uuid.v4()
	}, function(err, result) {
		if (err) return callback(err);
		if (!result[0]) return callback(new Error("保存失败"));
		callback(err, new Admire(result[0]));
	});
};

Admire.get = function(admireId, callback) {
	commonDao.findOne(collectionName, {
		id: admireId
	}, function(err, result) {
		if (err) return callback(err);
		callback(err, result ? new Admire(result) : result);
	});
};

Admire.removeByComment = function(commentId, callback) {
	commonDao.remove(collectionName, {
		commentId: commentId
	}, callback);
};

Admire.getByUser = function(username, curPage, perPage, callback) {
	commonDao.find(collectionName, {
		condition: {
			username: username
		},
		sort: {
			time: -1
		},
		page: {
			curPage: curPage,
			perPage: perPage
		}
	}, __resultToListFn(callback));
};

Admire.countByUser = function(username, callback) {
	commonDao.count(collectionName, {
		username: username
	}, callback);
};

Admire.prototype.remove = function(callback) {
	commonDao.remove(collectionName, {
		username: this.username,
		commentId: this.commentId
	}, callback);
};

Admire.countByComment = function(commentId, callback) {
	commonDao.count(collectionName, {
		commentId: commentId
	}, callback);
};

Admire.checkAdmired = function(username, commentId, callback) {
	commonDao.findOne(collectionName, {
		username: username,
		commentId: commentId
	}, function(err, result) {
		if (err) return callback(err);
		if (!result) return callback(err, false);
		return callback(err, true);
	});
};