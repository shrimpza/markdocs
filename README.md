# Markdocs

A simple HTML and JavaScript application for organising individual Markdown documents as a documentation collection.

No pre-building, rendering or compiling of the documentation or indeces is required - the table of contents and HTML output is built and rendered at runtime in the client's browser.

The only preparation that's required is the definition of a small JSON index file, which determines which documents to include.

An [example of Markdocs showing this README document](https://shrimpza.github.io/markdocs/) is available.

## Usage

Download or clone the [Markdocs Git repository](https://github.com/shrimpza/markdocs), and make it available via an HTTP service.

### Configuring the index

Within the document root, you will find the `index.json` file. This file is used to configure which Markdown documents to include, as well as some other options like the page title.

Here is the content from a simple `index.json`:

```json
{
  "title": "Documentation Collection",
  "showAll": false,
  "groups": [
    {
      "group": "Markdocs",
      "contents": [
        {
          "url": "README.md",
          "depth": 3,
          "editUrl": "https://github.com/org/repo/edit/master/README.md",
          "showSource": true
        }
      ]
    },
    {
      "group": "Something Else",
      "contents": [
        {
          "title": "Some Project",
          "url": "http://example.tld/project.md",
          "depth": 2
        },
        {
          "url": "http://cors-proxy.tld/?url=otherthing.md",
          "depth": 2,
          "dataType": "json"
        }
      ]
    }
  ]
}
```

#### Field Definitions:

- **`title`**
 - Overall page title.
- **`showAll`**
 - If true, all documents specified in the index will be added to the page at startup, rather than on demand when clicked - this can be useful for contineuous reading.
- **`groups[]`**
 - Array of `group` objects which make up the document index.
- **`groups[].group`**
 - Group heading/title - used to organise the table of contents into groups.
- **`groups[].contents[]`**
 - Array of document objects, each representing a Markdown document.
- **`groups[].contents[].title`**
 - Optionally, a document title. Typically, the title will be defived from the first heading of the document.
- **`groups[].contents[].url`**
 - URL of the Markdown document to include. Can be any format, local or remote. Same-origin restrictions apply, so a suitable "proxy" service or script may be required perform cross-domain requests.
- **`groups[].contents[].depth`**
 - Specify the heading level that will be linked to in the table of contents.
- **`groups[].contents[].dataType`**
 - Optionally, if using a "proxy" service or script which requires it, specify the expected content type.
- **`groups[].contents[].editUrl`**
 - Optional URL linking to a page which allows users to edit this document.
- **`groups[].contents[].showSource`**
 - Optionally set to `true`, will provide a link to the `url` for this document, allowing users to download or view the source document.

