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

Build the intermediary `events.html` file from the [markdown event documents](/doc/events):

```shell
mk events
```

### Gallery

Build the `gallery.json` file describing the gallery images:

```shell
mk gallery
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

Build [README.md](/README.md):

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
