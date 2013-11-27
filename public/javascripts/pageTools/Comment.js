(function($, window) {
		var emitter = $(document),
			__appendComment = function(curUser, comment, container, reply, optCallbacks) {
				var $comment,
					$avatar = $("<div class='u-avatar' uid='" + comment.username + "'></div>"),
					$commentInfo = $("<div class='g-info'><span class='u-nick'></span><span class='u-time'>" + comment.time + "</span></div>"),
					$commentContent = $("<div class='u-content'></div>"),
					$admireSpan = $("<span class='u-opt' cid='" + comment.id + "'><span>"),
					$replySpan = $("<span class='u-opt reply'><span class='glyphicon glyphicon-comment'></span><span>"),
					$deleteSpan = $("<span class='u-opt delete'><span class='glyphicon glyphicon-remove'></span><span>"),
					$operate = $("<div class='g-operate', cid='" + comment.id + "'></div>");
				$comment = $("<div class='g-comment-row' id='cmt_" + comment.id + "'></div>");

				if (reply) {
					__appendComment("", reply, $commentContent, null, {});
					$commentContent.find(".g-comment-row").addClass("b-comment-reply");
					$commentContent.find("hr").remove();
				}
				$commentContent.append(comment.comment);

				$comment.append($avatar).append($commentInfo);
				$comment.append($commentContent);

				if (curUser === comment.username) {
					$operate.append($deleteSpan);
					$deleteSpan.click(__fnDelete);
					if (optCallbacks.fnDelete) {
						$deleteSpan.click(optCallbacks.fnDelete);
					}
				}

				$operate.append($admireSpan).append($replySpan);

				if (optCallbacks.fnReply) {
					$replySpan.click(optCallbacks.fnReply);
				}

				if (optCallbacks.fnAdmire) {
					$admireSpan.click(optCallbacks.fnAdmire);
				}

				emitter.trigger("admire.draw", [comment.id, $admireSpan]);

				if (curUser) $comment.append($operate);
				$comment.append("<hr/>");
				$(document).trigger("user.draw", [$avatar.attr("uid"), $avatar,
					function(user) {
						$commentInfo.find(".u-nick").text(user.nickname);
					}
				]);
		container.append($comment);
	},
	__fnDelete = function(event) {
		var that = $(this);
		$(document).trigger("comment.delete", [that.parent().attr("cid"), {
			container: that.parent().parent(),
		}]);
	},
	__fnCommentRemove = function($comment) {
		$comment.fadeOut(function() {
			$(this).remove();
		});
	};
	emitter.bind("comment.draw", function(event, articleId, curUser, container, optCallbacks,fnCallback) {
		if (container) {
			container.addClass("b-comment-loading");
		}
		emitter.trigger("comment.getArticleComments", [articleId,
			function(comments) {
				var i, m,
					reply,
					j;
				if (container) {
					for (i = 0, m = comments.length; i < m; i++) {
						if (comments[i].reply) {
							for (j = 0, m = comments.length; j < m; j++) {
								if (comments[i].reply === comments[j].id) {
									reply = comments[j];
									break;
								}
							}
						}
						__appendComment(curUser, comments[i], container, reply, {
							fnReply: optCallbacks.replyClick,
							fnAdmire: optCallbacks.admireClick,
							fnDelete: optCallbacks.deleteClick
						});
					}
					container.removeClass("b-comment-loading");
					if(fnCallback) fnCallback(comments);
				}
			}
		]);
	}).bind("comment.getArticleComments", function(event, articleId, fnCallback) {
		$.ajax({
			url: "/comment_getByArticle",
			type: "post",
			dataType: "json",
			data: {
				articleId: articleId
			}
		}).done(function(data) {
			if (fnCallback) {
				fnCallback(data.comments);
			}
		}).fail(function(err) {
			console.log(err);
		});
	}).bind("comment.countArticleComments", function(event, articleId, fnCallback) {
		$.ajax({
			url: "/comment_countByArticle",
			type: "post",
			data: {
				articleId: articleId
			},
			dataType: "json"
		}).done(function(data) {
			if (fnCallback) {
				fnCallback(data.total);
			}
		}).fail(function(err) {
			console.log(err);
		});
	}).bind("comment.countUserComments", function(event, username, fnCallback) {
		$.ajax({
			url: "/comment_countByUser",
			type: "post",
			data: {
				username: username
			},
			dataType: "json"
		}).done(function(data) {
			if (fnCallback) {
				fnCallback(data.total);
			}
		}).fail(function(err) {
			console.log(err);
		});
	}).bind("comment.delete", function(event, commentId, fnCallback) {
		$.ajax({
			url: "/nor/comment_delete",
			type: "post",
			data: {
				commentId: commentId
			},
			dataType: "json"
		}).done(function(data) {
			if (fnCallback) {
				fnCallback();
			}
		}).fail(function(err) {
			console.log(err);
		});
	});
}(jQuery, window));