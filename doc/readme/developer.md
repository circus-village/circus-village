## Developer

Install dependencies (`npm i`) and the mkdoc tools globally `npm i -g mkdoc` then you can see the available tasks with `mk --tasks`.

### Site

Build the static website:

```shell
mk site
```

### Events

Build the intermediary `events.html` file from the [markdown event documents](/doc/events):

```shell
mk events
```

### Javascript

Build the client-side javascript:

```shell
mk js
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

### Pages

Publish the website build to a `gh-pages` branch:

```shell
npm run pages
```
