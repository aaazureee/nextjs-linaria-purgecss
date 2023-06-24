# nextjs-linaria-purgecss
Next.js example with [Linaria](https://github.com/callstack/linaria/tree/master) (works with Next.js 13), with support for [PurgeCSS](https://purgecss.com/introduction.html) to remove unused styles (from css modules or Linaria)  

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/aaazureee/nextjs-linaria-purgecss)

## Motivation: 
Have some issues setting up Next.js with Linaria with current resources so I created this to share my results after playing around with it.  

## Resources: 
- Next.js examples: https://github.com/vercel/next.js/tree/canary/examples/with-linaria, which uses https://github.com/Mistereo/next-linaria under the hood for next.config.js, which can't be used together with CSS modules for some reason => workaround thanks to this issue (https://github.com/Mistereo/next-linaria/issues/10). See [`next-linaria-custom.js`](https://github.com/aaazureee/nextjs-linaria-purgecss/blob/master/next-linaria-custom.js) for local version.

## Support for PurgeCSS, and why?
- If you use CSS modules or CSS, it's kinda self-explanatory why you can use PurgeCSS to strip unused styles, because we are loading CSS and sometimes unused styles definition are included in there, i.e.
```css
/* styles.module.css */
.one {
}

.two {
}
```
  
```javascript
/* React */
import styles from 'file_name.module.css'

const Component = () => {
  return (
    <div className={styles.one}>
      Hi
    </div>
  )
}

// => css for `.two` will still be included in final code
```
- How about Linaria, with the concept of build time CSS in JS which extracts to CSS. Well, kind of. It will only load CSS for components that will be used in your code, so initial thought it's like we prolly don't need to use PurgeCSS. However, after playing around with it, there is this case that Linaria does not fully utilize ESM tree shaking and still includes unused styles. Let's look at this example:

```javascript
/* styles.ts */
import { styled } from '@linaria/react'

export const Box1 = styled.div`
  background-color: teal;
`;

export const Box2 = styled.div`
  background-color: pink;
`;

export const Box3 = styled.div`
  background-color: purple;
`;
```

```javascript
/* React */
import { Box2 } from '../styles'

const Component = () => {
  return (
    <Box2>
      Hi
    </Box2>
  )
}
```

In this case, JS bundled code will only include code for `Box2` (due to ESM tree shaking) ✅. However, output CSS file includes styles of everything, for `Box1`, `Box2`, `Box3` ❌ (you can test it yourself after build).  
  
How do we solve this using PurgeCSS? The process is kinda hacky. Let's look at these configs first:  
  
**Linaria Webpack Loader** (See [here](https://github.com/aaazureee/nextjs-linaria-purgecss/blob/master/next-linaria-custom.js))
```javascript
config.module.rules.push({
  test: /\.(tsx|ts|js|mjs|jsx)$/,
  exclude: /node_modules/,
  use: [
    {
      loader: require.resolve('@linaria/webpack-loader'),
      options: {
        // ...other unimportant stuff
        // => this basically return hashed classname with suffix (LINARIA_CLASS_SUFFIX) to identify style from Linaria in bundled CSS file
        classNameSlug: (slug, displayName) => {
          return `${toValidCSSIdentifier(displayName)}_${slug}_${LINARIA_CLASS_SUFFIX}` 
        },
        ...linaria,
      },
    },
  ],
});
```
=> Whenever script files are loaded, Linaria webpack loader will extract the styles from JS files to CSS and output it to postcss-loader (see below). We will add a suffix to all classnames generated from Linaria to mark it.

**PostCSS config** (See [here](https://github.com/aaazureee/nextjs-linaria-purgecss/blob/master/postcss.config.js))
```javascript
// purge css modules in prod
if (process.env.NODE_ENV !== 'development') {
  plugins.push([
    '@fullhuman/postcss-purgecss',
    {
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [new RegExp(`${LINARIA_CLASS_SUFFIX}$`)],
      skippedContentGlobs: ['./src/pages/api/**/*'],
    }
  ])
}
```

=> postcss-loader will utilize PurgeCSS plugin to strip out unused styles by comparing contents from scripts file (in `content`) with the CSS output received during webpack building process. Look at the `safelist` here, basically we are telling it that we are not stripping styles from Linaria output here (marked with suffix above). So why are we doing that?   
  
Here, it's comparing the content of file during build process (scripts in `src` folder) with the hashed CSS output of Linaria and original CSS output from CSS/CSS module files (these will be hashed later in next phase by Next.js default webpack config, i.e. in css-loader). 
- Hashed output comparison will always be unequal => It will strip all hashed styles from Linaria even though we are using them. ❌
- Original output comparison works => CSS/CSS modules styles will be stripped correctly. ✅  
  
To solve the Linaria case, we will instead process purgecss after everything has been built, i.e. a post-build script, which looks like this:
```json
"scripts": {
  "preinstall": "npx only-allow pnpm",
  "dev": "npm run rm-cache && next dev",
  "build": "npm run rm-cache && next build && npm run purge-linaria-css",
  "purge-linaria-css": "purgecss --css ./.next/static/css/*.css --content ./.next/**/*.{js,jsx,html} --output ./.next/static/css",
},
```
=> It will override CSS files in build output after stripping unused styles.

## Alternatives?
- Other build time CSS in JS (haven't tried yet): Astroturf, Compiled (atlassian), panda-css (new)
