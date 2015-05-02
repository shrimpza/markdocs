MDoc = function(index) {
	this.index = index;

	/**
	 * Load the contents of the index for this MDoc instance, and 
	 * call the onDone callback once complete.
	 */
	this.load = function(onDone) {
		// remember who we are, since "this" gets lost within callbacks
		var _mdoc = this;

		// keep track of number of documents requested so we can trigger a done event later
		var _expected = 0;

		$.each(this.index.contents, function(i, group) {
			_expected += group.contents.length;

			$.each(group.contents, function(c, content) {

				$.getJSON(content.url, 
					function(data) {
						content.document = data.contents;
						content.toc = [];

						var tokens = marked.lexer(data.contents);
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

						_expected --;

						// once everything is collected, trigger onDone callback
						if (_expected == 0) {
							onDone(_mdoc);
						}
					}
				)
			});

		});

		return this;
	}

	/**
	 * load a document into the renderTarget, can call onDone if present
	 */
	this.navigate = function(page, section, renderTarget, onDone) {
		renderTarget.html(marked(page.document));

		if (onDone != null) onDone();
	}
}
