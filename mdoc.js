MDView = function(docTarget, tocTarget) {
	this.docTarget = docTarget;
	this.tocTarget = tocTarget;

	this.buildView = function(loader) {
		$("#doc").empty();
		$("#toc").empty();

		var _this = this;

		$.each(loader.index.contents, function(i, grp) {
			_this.tocTarget.append($("<div/>").addClass("header item").text(grp.group));

			$.each(grp.contents, function(d, doc) {
				var index = i.toString() + "_" + d.toString();
				var renderer = _this.pageRenderer(index, 2);

				if (loader.index.showAll || _this.docTarget.children().length == 0) {
					_this.showDoc(false, doc, renderer);
				}

				var tocHead = $("<div/>").addClass("item");
				var tocMenu = $("<div/>").addClass("menu");
				tocHead.append(tocMenu);
				_this.tocTarget.append(tocHead);

				$.each(doc.toc, function(t, toc) {
					var menuItem = $("<a/>").addClass("item toc-" + toc.depth + "-deep")
						.attr("href", "#" + index + "_" + toc.slug)
						.text(toc.title);

					if (!loader.index.showAll) {
						menuItem.click(function() {
							_this.showDoc(true, doc, renderer);
						});
					}

					tocMenu.append(menuItem);
				});
			});
		});
	}

	this.showDoc = function(clear, doc, renderer) {
		if (clear) this.docTarget.empty();

		var docDiv = $("<div/>").addClass("ui segment")
			//.append($("<h1/>").addClass("ui dividing header").text(doc.title))
			.append(marked(doc.document, { renderer: renderer }))
			.append($("<div/>").addClass("ui hidden divider"));

		this.docTarget.append(docDiv);
	}

	/**
	 * Create a marked renderer with custom header renderer, used
	 * to ensure that we generate unique section ids for linking.
	 * Also, heading levels below dividingLevel will be set as 
	 * dividers.
	 */
	this.pageRenderer = function(index, dividingLevel) {
		var renderer = new marked.Renderer();
		renderer._index = index;

		renderer.heading = function(text, level) {
			var slug = text.toLowerCase().replace(/[^\w]+/g, '-');
			return $("<div/>")
					.append($("<h" + level + "/>")
						.attr("id", this._index + "_" + slug)
						.addClass(dividingLevel ? "ui dividing header" : "")
						.text(text)
					).html();
		};

		renderer.code = function(code, lang, escaped) {
			return $("<div/>")
					.append($("<pre/>").addClass("ui secondary segment")
						.append($("<code/>")
							.addClass(lang ? this.options.langPrefix + lang : "")
							.text(code))
					).html();
		};

		return renderer;
	}
}

MDLoader = function(index) {
	this.index = index;

	/**
	 * Load the contents of the index for this MDoc instance, and 
	 * call the onDone callback once complete.
	 */
	this.load = function(onDone) {
		// remember who we are, since "this" gets lost within callbacks
		var _this = this;

		// keep track of number of documents requested so we can trigger a done event later
		var _expected = 0;

		$.each(this.index.contents, function(i, group) {
			_expected += group.contents.length;

			$.each(group.contents, function(c, content) {

				$.ajax({
						url: content.url,
						dataType: content.dataType ? content.dataType : "text"
					})
					.success(function(data) {
						if (data.contents) data = data.contents;

						content.document = data;
						content.toc = [];

						var tokens = marked.lexer(data);
						for (var i = 0; i < tokens.length; i++) {

							// use headings to build a TOC
							if (tokens[i].type == 'heading') {

								// if no title is present, pull it from the first H1 of the document
								if (tokens[i].depth == 1 && content.title == null || content.title == '') {
									content.title = tokens[i].text;
								}

								// only use headings below the desired depth for this document
								if (tokens[i].depth <= content.depth) {
									content.toc.push({
										title: tokens[i].text,
										slug: tokens[i].text.toLowerCase().replace(/[^\w]+/g, '-'),
										depth: tokens[i].depth
									});
								}
							}
						}
					})
					.fail(function(req, status, err) {
						var title = content.title ? content.title : "Unknown Document";
						content.document = "# " + title + " \n\n **Failed to load document**" + (err ? ":\n\n" + err : "");
						content.toc = [{
							title: title,
							slug: title.toLowerCase().replace(/[^\w]+/g, '-'),
							depth: 1
						}];
					})
					.always(function() {
						_expected --;

						// once everything is collected, trigger onDone callback
						if (_expected == 0) {
							onDone(_this);
						}
					});
			});

		});

		return this;
	}
}