## Developer

Install dependencies (`yarn install`) and the mkdoc tools globally (`yarn global add mkdoc`) then you can see the available tasks with `mk --tasks`. You also need [makestatic][] installed globally.

### Site

Build the static website:

```shell
makestatic
```

Build and serve the website with [browsersync][] enabled:

```shell
makestatic -w
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

```shell
makestatic --clean --env stage --provider s3
makestatic --clean --env production --provider s3
```
