# Circus Village

Static website for the circus village.

---

- [Developer](#developer)
  - [Site](#site)
  - [Events](#events)
  - [Gallery](#gallery)
  - [Thumbnail](#thumbnail)
  - [Slides](#slides)
  - [Javascript](#javascript)
  - [Events Javascript](#events-javascript)
  - [Styles](#styles)
  - [Readme](#readme)
  - [Lint](#lint)
  - [Deploy](#deploy)
- [License](#license)

---

## Developer

Install dependencies (`npm i`) and the mkdoc tools globally (`npm i -g mkdoc`) then you can see the available tasks with `mk --tasks`.

### Site

Build the static website:

```shell
mk site
```

Build and serve the website with [browsersync][] enabled:

```shell
mk site --sync --dev
```

When the `--dev` flag is used files are not minified.

### Events

Build the intermediary `events.html` file from the [markdown event documents](https://github.com/tmpfs/circus-village/blob/master/doc/events):

```shell
mk events
```

### Gallery

Build the `gallery.json` file describing the gallery images:

```shell
mk gallery
```

### Thumbnail

Generate thumbnails for the photo gallery images:

```shell
mk thumbnails
```

### Slides

Build the `slides.json` list of slideshow images:

```shell
mk slides
```

### Javascript

Build the client-side javascript:

```shell
mk js
```

### Events Javascript

Build the client-side javascript that orders the event elements based on the event dates:

```shell
mk ejs
```

### Styles

Build the stylesheet:

```shell
mk css
```

### Readme

Build [README.md](https://github.com/tmpfs/circus-village/blob/master/README.md):

```shell
mk readme
```

### Lint

Lint the javascript source:

```shell
npm run lint
```

### Deploy

Publish the website for the `master` branch for `circus-village.github.io`:

```shell
npm run deploy
```

Must have a `deploy` remote configured:

```shell
git remote add deploy git@github.com:circus-village/circus-village.github.io.git
```

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on May 18, 2016

[browsersync]: http://browsersync.io
[jshint]: http://jshint.com
[jscs]: http://jscs.info

